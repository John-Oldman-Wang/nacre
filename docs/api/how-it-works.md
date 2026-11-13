---
type: concept
---

# 运行时怎么工作

Nacre 是 iOS 上的 JavaScript 运行时。App 的全部逻辑和界面由一份 JS 代码决定，运行时负责执行它，并把 iOS 的原生视图和系统能力作为全局的类和对象提供给它。

下面的内容对所有 API 都成立，各页不再重复。

## 你的代码怎么被执行

**整个 App 的 JS 是一个文件。** 它在构建时打包进 App，App 每次启动时从头执行一次。运行时不会在执行过程中加载别的文件，源码里的 `import` 要先用打包工具（比如 esbuild）合成一个文件。

**文件执行完，App 不会结束。** 顶层代码执行完之后，App 继续运行，等待事件、定时器和 `Promise` 的结果。顶层注册的监听器和变量在 App 运行期间一直有效。

**始终是严格模式。** 给只读属性赋值、使用没声明的变量，都会抛异常，不会静默失败。源码里不需要自己写 `'use strict'`。

**界面要等系统准备好才能建。** 文件顶层执行时，系统还没有给 App 分配显示界面的位置（称为场景）。建界面的代码写在 `sceneconnect` 事件的回调里。运行时保证这个事件在整个文件执行完之后才派发，所以在顶层注册监听器一定能收到。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
});
```

**效果**：App 启动后显示一个空白页面，底色跟随系统的浅色或深色模式。每个 App 都从这几行开始。

顶层适合做不涉及界面的事：读 App 的信息、读本地存储、发网络请求、注册监听器。回调里那几行各自的含义见 [`application`](application.md)、[`UIWindowScene`](ui-window-scene.md) 和 [`UIWindow`](ui-window.md)。

## 有什么，没有什么

| 有 | 没有 |
| --- | --- |
| 完整的 JS 标准库：`Promise`、`Map`、`JSON`、类型化数组、迭代器等 | DOM：`window`、`document`、`location`、HTML 元素、CSS |
| `console`、定时器（`setTimeout` 等）、`performance`、`crypto.getRandomValues()` | `Intl` 和所有按地区格式化的能力 |
| 网络：`fetch`、`URL`、`WebSocket` | `TextEncoder`、`crypto.subtle`、`structuredClone` |
| 事件：`EventTarget`、`addEventListener()` | `WebAssembly` |
| iOS 的原生类：`UIView`、`UIButton`、`UILabel` 等，直接用原名 | Node 的 `require`、`process`、`Buffer` |

能用的原生类只有 [API 总览](README.md)里列出的那些。没列出的 iOS 类在 JS 里不存在，读它的名字会抛 `ReferenceError`。

## JS 和界面在同一个线程上

JS 代码、界面的布局和绘制、触摸的处理，在同一个线程上依次执行。一段 JS 从开始到结束不会被别的代码打断。

这样安排有三个直接的结果。

**读布局是同步的。** 改完视图立刻就能读到算好的位置和大小，不需要等回调。

```js
const label = new UILabel();
label.text = 'Hello';
const size = label.sizeThatFits(new CGSize(300, 100));
console.log(size.width > 0);
```

**结果**：控制台输出 `true`。`sizeThatFits()` 返回时文字的大小已经算好。

**改界面立刻生效。** 给属性赋值之后马上读，得到的就是新值。同一段代码里对界面的所有修改，在这段代码结束后的同一帧一起显示，屏幕上不会出现只改了一半的画面。

**不需要处理并发。** 回调一个接一个执行，两个回调不会同时读写同一份数据。

### 界面操作的耗时

以下是在运行时上实测的数值：

| 操作 | 耗时 |
| --- | --- |
| 调用一次原生能力（读或写一个属性、调一个方法） | 1.3–2.4 微秒 |
| 创建一个视图（`new UIView()`） | 约 4 微秒 |
| 写一个属性 | 2–7 微秒 |
| 建一条约束 | 约 10 微秒 |
| 加一个子视图（`addSubview()`） | 约 12 微秒 |

屏幕刷新率是 120 Hz 时，一帧是 8.3 毫秒，这段时间能执行三千多次属性写入。

运行时还为界面的流畅做了三件事：

- **滚动不等 JS。** 滚动视图跟随手指移动由系统直接完成。`scroll` 事件只是通知，系统不等监听器执行完再滚。
- **`scroll` 事件每一轮最多派发一次。** 一轮之内发生的多次滚动合并成一个事件。监听器里从滚动视图上读到的总是最新的位置，所以合并不丢信息。见 [`UIScrollView`](ui-scroll-view.md)。
- **定时器分批执行。** 同时到期的定时器很多时，运行时连续执行最多 8 毫秒就先让屏幕刷新、处理触摸，剩下的在下一轮继续。见[定时器](timers.md)。

### 和界面无关的大量计算

一段 JS 从开始到结束是连续执行的，这期间屏幕不刷新，触摸在它结束之后才被处理。上面那些界面操作都在微秒级，不受这一条影响。受影响的是和界面无关、一次执行很久的计算，比如解析一份很大的数据、对上万条记录排序。

这类计算拆成小块，用定时器分几次做，每一块之间屏幕照常刷新：

```js
/** @type {number[]} */
const items = [];
for (let i = 0; i < 100000; i++) items.push(i);

let sum = 0;
let index = 0;

function step() {
  // 每次只处理 2000 条
  const end = Math.min(index + 2000, items.length);
  for (; index < end; index++) sum += items[index];

  if (index < items.length) {
    setTimeout(step, 0);
  } else {
    console.log('算完了', sum);
  }
}
step();
```

**结果**：十万条数据分 50 次处理完，控制台输出 `算完了 4999950000`。**这段代码未在模拟器验证。**

每一块取多大，可以用 [`performance.now()`](performance.md) 量出来再定。定时器的一次回调执行超过 50 毫秒时，运行时在控制台输出一条警告，报出实际的毫秒数：

```
Timer callback blocked the main thread for 83 ms; this frame will drop
```

看到这条警告，就把那个回调里的工作再拆小。

## 耗时的操作在后台执行

网络请求、读写文件、图片解码这类操作由运行时在后台执行，做完再把结果交回 JS。等待期间 JS 可以继续做别的事，界面照常响应。

这些 API 都返回 `Promise`：

```js
const res = await fetch('https://httpbin.org/get');
const data = await res.json();
console.log(typeof data);
```

**结果**：请求完成后控制台输出 `object`。从发出请求到拿到结果的这段时间，界面可以正常操作。

## 两种异步：Promise 和事件

| 情况 | 形式 | 例子 |
| --- | --- | --- |
| 发起一次，得到一个结果 | `Promise` | `fetch()`、读文件、模态弹出一个页面 |
| 会反复发生的通知 | 事件 | 点击、滚动、App 进后台 |

没有回调参数，也没有 `onSuccess`、`onError` 这类属性。

## 事件

所有能发事件的对象都用同一套写法：`addEventListener(type, callback)` 注册监听器，`removeEventListener(type, callback)` 移除。同一个事件名下，同一个函数重复注册只算一次。

```js
const button = new UIButton();
button.addEventListener('primaryActionTriggered', (e) => {
  console.log(e.type, e.target === button);
});
```

**效果**：按钮显示在界面上并被用户点击时，控制台输出 `primaryActionTriggered true`。

事件的行为有下面几条：

- **事件只派发给注册了监听器的那个对象。** 事件不会传给父视图，也没有捕获阶段。要知道一个按钮被点了，就在这个按钮上注册。
- **系统事件的回调在事情发生之后执行。** 点击、滚动、前后台切换这类由系统引起的事件，运行时等当前正在进行的系统操作结束，再执行回调。回调里读到的状态是执行回调那一刻的。比如 `scroll` 的回调里读 `contentOffset`，得到的是当前的滚动位置，不是引起这次事件的那个位置。
- **大多数系统事件不能取消。** 回调执行时事情已经发生，`preventDefault()` 对它们没有效果，也不报错。事件对象的 `cancelable` 是 `false`。例外会在对应的页面写明，比如 [`WebView`](web-view.md) 的 `will-navigate` 可以取消。
- **事件对象通常只有 `type` 和 `target`。** 需要的数据从 `target` 上读，比如滚动位置读 `scroller.contentOffset`。少数事件带自己的数据，比如触摸类的控件事件带触点位置，见 [`UIControl`](ui-control.md)。
- **监听器里抛出的异常不影响别的监听器，也不会让 App 退出。** 运行时把它输出到控制台，开头是 `Event listener threw:`，同一个事件的其余监听器照常执行。
- **原生对象只接受它自己的事件名。** 在按钮上监听一个它没有的事件名，`addEventListener()` 抛 `TypeError`，所以事件名拼错当场就能发现。[`application`](application.md) 和自己构造的 `EventTarget` 可以用任意事件名。

用 `dispatchEvent()` 自己派发的事件是同步的：`dispatchEvent()` 返回之前，所有监听器已经执行完。成员的完整说明见 [`application`](application.md)。

## 原生对象

`UIView`、`UIButton` 这些类的实例表示 iOS 的原生对象。读写它的属性、调它的方法，操作的就是那个原生对象。

- **不用手动释放。** 没有任何引用之后，对象会被自动回收。
- **加进界面的对象不会被回收。** 把视图加到父视图上、把页面交给窗口之后，不需要另外保存引用。
- **加监听器不会让对象留下来。** 从界面上移除、又没有别处引用的对象会被回收，它的监听器一起消失。所以离开一个页面时，不需要逐个调 `removeEventListener()`。
- **正在工作的对象不会被回收，即使没有保存引用。** 有两种：还没关闭的 [`WebSocket`](websocket.md)，以及已经调过 `addToRunLoop()`、还没调 `invalidate()` 的 [`CADisplayLink`](ca-animation.md)。关闭或失效之后它们和普通对象一样被回收。
- **同一个原生对象永远对应同一个 JS 对象。** 所以可以用 `===` 比较，比如 `view.superview === parent`。
- **原生类不能被继承。** `class MyView extends UIView` 在构造时会抛异常。要扩展行为，用组合：写一个函数创建并配置视图。详见[原生类](native-classes.md)。

## 写错了会怎样

写错的代码会得到明确的报错，不会静默地什么都不发生。

- 枚举写了不认识的值、少传必填的参数、给只读属性赋值，都抛 `TypeError`。枚举的报错信息里列出全部可用的值。
- 值的类型转不成期望的类型时抛 `TypeError`，见[传进来的值怎么转换](#传进来的值怎么转换)。
- 系统不接受的调用也抛 `TypeError`，不会让 App 退出。比如把一个视图加成它自己的子视图，报错是 `addSubview: raised NSInvalidArgumentException: Can't add self as subview`，冒号后面是系统给的原因。这类错误出现时，系统那一侧的状态可能已经不一致，应当修掉引起它的代码，不要靠 `try` / `catch` 继续运行。
- 没被捕获的异常和没被处理的 `Promise` 拒绝不会让 App 退出。运行时把它们输出到控制台，App 继续运行。要统一处理，在 [`application`](application.md) 上监听 `error` 和 `unhandledrejection`。

有两处不抛：

- 颜色字符串写错只输出警告，保留原来的颜色。见[颜色](ui-color.md)。
- 属性名拼错不报错。`view.backgroundColour = 'red'` 只是在这个 JS 对象上多加了一个普通属性，界面不变。这类错误由类型检查发现：装上 `@nacre/types` 之后，编辑器会在这一行报错并提示正确的名字。

## 传进来的值怎么转换

给属性赋值、给方法传参数时，值的类型不必完全对。运行时按期望的类型转换，转换的结果就是 `Number()`、`Boolean()`、`String()` 的结果：

| 期望的类型 | 怎么转 | 例子 |
| --- | --- | --- |
| 数 | `Number(v)` | `view.alpha = '0.5'` 得到 0.5；`view.alpha = null` 得到 0 |
| 整数（下标、个数） | `Number(v)` 后去掉小数部分 | `view.tag = 3.9` 得到 3 |
| 布尔 | 按真假值，和 `if (v)` 的判断相同 | `view.isHidden = 1` 得到 `true`；`view.isHidden = 'false'` 也得到 `true`，因为非空字符串为真 |
| 字符串 | `String(v)` | `label.text = 5` 得到 `'5'` |
| options 对象的成员 | 值是 `undefined` 等于没写这个成员 | `{ scale: undefined }` 等于 `{}` |

转不出合法的值时抛 `TypeError`：

```js
const view = new UIView();
try {
  // @ts-expect-error 类型检查不允许 undefined
  view.alpha = undefined;
} catch (err) {
  console.log(String(err));
}
console.log(view.alpha);
```

**结果**：控制台输出 `TypeError: alpha must be a finite number, got undefined`，然后输出 `1`。`alpha` 保持原来的值。`'abc'`、`NaN`、`Infinity`、对象也是这样。

四点要注意：

- **`null` 赋给数字属性得到 0，不报错。** 因为 `Number(null)` 是 0。要表达「没有值」时不要用 `null`。
- **`null` 和 `undefined` 赋给字符串属性表示清空。** 属性可以为空时读回来是 `null`（比如 `label.text`），不可以为空时读回来是空字符串（比如输入框的 `text`）。
- **枚举不转换。** 写了不认识的值直接抛，见[枚举](enums.md)。
- **原生对象不转换。** 要求传视图的地方传了别的东西，抛 `TypeError`。本来就可以为空的参数和属性可以传 `null`。

类型定义（`@nacre/types`）比运行时严格：`view.alpha = '0.5'` 能运行，但类型检查会报错。推荐按类型定义写，传类型正确的值；转换规则的用处是让从输入框、存储里读出来的字符串和数字不经处理也能直接用。

## 长度的单位

所有长度和坐标的单位都是点（pt），不是像素。1 pt 在屏幕上占几个像素由设备决定。见[单位](units.md)。

## 参见

- [`application`](application.md)：表示正在运行的这个 App，界面代码的入口事件在它上面
- [`UIWindowScene`](ui-window-scene.md)：场景什么时候有、什么时候没有，启动代码怎么组织
- [原生类](native-classes.md)：构造、继承、往对象上挂自己的数据
- [定时器](timers.md)：把计算拆成小块时用到
- [单位](units.md)
- [实现原理](../internals/README.md)：以上每一条为什么是这样
