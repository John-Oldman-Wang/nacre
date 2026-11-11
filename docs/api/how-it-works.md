---
type: concept
---

# 运行时怎么工作

这一页讲用 Nacre 写 App 之前需要知道的几件事。它们对所有 API 都成立，各页不再重复。

读者如果写过浏览器里的 JS，可以把 Nacre 理解成：**同样的语言，换了一套宿主**。没有 DOM，取而代之的是 iOS 的原生视图。

## 你的代码怎么被执行

- **整个 App 的 JS 是一个文件。** 它在构建时打包进 App，启动时执行一次。运行时不能在执行过程中加载别的文件，所以源码里的 `import` 要先用打包工具（比如 esbuild）合成一个文件。
- **始终是严格模式。** 给只读属性赋值、使用没声明的变量，都会抛异常，不会静默失败。
- **界面要等系统准备好才能建。** 文件顶层执行时还没有可用的屏幕。建界面的代码写在 `sceneconnect` 事件的回调里，见 [`application`](application.md)。

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

## 有什么，没有什么

| 有 | 没有 |
| --- | --- |
| 完整的 JS 标准库：`Promise`、`Map`、`JSON`、类型化数组、迭代器等 | DOM：`window`、`document`、`location`、HTML 元素、CSS |
| `console`、定时器（`setTimeout` 等）、`performance`、`fetch`、`URL` | `Intl` 和所有按地区格式化的能力 |
| 事件：`EventTarget`、`addEventListener()` | `TextEncoder`、`crypto`、`structuredClone` |
| iOS 的原生类：`UIView`、`UIButton`、`UILabel` 等，直接用原名 | `WebAssembly` |
| | Node 的 `require`、`process`、`Buffer` |

能用的原生类只有 [API 总览](README.md) 里列出的那些。

## JS 和界面在同一个线程上

你的 JS、界面的布局和绘制、触摸和滚动的处理，都在同一个线程上执行。这带来三个结果。

**读布局是同步的。** 改完视图立刻就能读到算好的位置和大小，不需要等回调。

```js
label.text = 'Hello';
const size = label.sizeThatFits(new CGSize(300, 100));   // 立刻得到结果
```

**JS 执行多久，界面就停多久。** 一段 JS 没执行完，屏幕不会刷新，滚动也会停住。浏览器里页面滚动由单独的线程处理，JS 卡住时照样能滚；这里不行。

**JS 的执行速度比浏览器慢。** 运行时逐行解释执行 JS，没有浏览器里那种把热点代码编译成机器码的优化。创建视图、设置属性这类操作很快，但大量循环计算会明显慢于浏览器。

所以：事件回调里只做必要的事，尤其是 `scroll` 这类高频事件。大量计算要拆成小块，用定时器分多次执行。

## 耗时的操作不卡界面

网络请求、读写文件、图片解码这类操作在后台执行，做完再把结果交回来。等待期间界面照常响应。

这些 API 都返回 `Promise`：

```js
const res = await fetch('https://httpbin.org/get');   // 等待期间界面不卡
const data = await res.json();
```

## 两种异步：Promise 和事件

| 情况 | 形式 | 例子 |
| --- | --- | --- |
| 发起一次，得到一个结果 | `Promise` | `fetch()`、读文件、模态弹出一个页面 |
| 会反复发生的通知 | 事件 | 点击、滚动、App 进后台 |

没有回调参数，也没有 `onSuccess`、`onError` 这类属性。

## 事件

所有能发事件的对象都用同一套写法：`addEventListener()`、`removeEventListener()`，和浏览器相同。有三点不同：

- **事件不冒泡。** 事件只派发给注册监听器的那个对象，不会传给父视图。
- **回调不是在事情发生的那一刻执行的。** 系统事件（点击、滚动、前后台切换）会排到下一轮任务里再执行回调。所以回调里读到的状态是执行回调那一刻的，可能已经变了。
- **系统事件不能取消。** `preventDefault()` 对它们不起作用，因为回调执行时事情已经发生了。

事件对象通常只有 `type` 和 `target`。需要的数据从 `target` 上读，比如滚动位置读 `scroller.contentOffset`。

## 原生对象

`UIView`、`UIButton` 这些类的实例是 iOS 原生对象在 JS 里的代表。

- **不用手动释放。** 没有任何引用之后，对象会被自动回收。
- **加进界面的对象不会被回收。** 把视图加到父视图上、把页面交给窗口之后，不需要另外保存引用。
- **同一个原生对象永远对应同一个 JS 对象。** 所以可以用 `===` 比较，比如 `view.superview === parent`。
- **原生类不能被继承。** `class MyView extends UIView` 在构造时会抛异常。要扩展行为，用组合：写一个函数创建并配置视图。详见[原生类](native-classes.md)。

## 写错了会怎样

运行时的原则是**写错了要让你知道**，不静默失败。

- 枚举写了不认识的值、少传必填的参数、给只读属性赋值，都抛 `TypeError`，报错信息里列出可用的值。
- 没被捕获的异常和没被处理的 Promise 拒绝，会输出到控制台，也可以在 [`application`](application.md) 上监听 `error` 和 `unhandledrejection` 事件统一处理。

有一个例外：颜色字符串写错只输出警告，保留原来的颜色。见[颜色](ui-color.md)。

## 长度的单位

所有长度和坐标的单位都是点（pt），不是像素。见[单位](units.md)。

## 参见

- [`application`](application.md)：App 的入口对象
- [原生类](native-classes.md)：构造、继承、往对象上挂自己的数据
- [单位](units.md)
- [实现原理](../internals/README.md)：以上每一条为什么是这样
