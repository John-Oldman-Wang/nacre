---
type: reference
native: UIWindow
status: partial
---

# `UIWindow`

**`UIWindow`** 表示窗口：一个场景里承载界面的最外层视图。页面和视图要放进窗口才能显示，窗口不显示，里面的内容就都不显示。

窗口建在场景上。场景（[`UIWindowScene`](ui-window-scene.md)）表示 App 界面的一个实例，由系统创建，是界面的前提：没有场景就建不出能显示的窗口。系统创建好场景后在 [`application`](application.md) 上派发 `sceneconnect` 事件，建窗口的代码写在这个事件的回调里。

窗口由 App 的代码创建，系统不替 App 建。App 启动后一个窗口都没有，屏幕是黑的，直到代码建出窗口并让它显示。新建的窗口是隐藏的，调 `makeKeyAndVisible()` 才显示。

窗口自己不负责排版。它的位置和大小由系统按场景设定，不需要设 `frame`。界面内容不直接加在窗口上，而是放在根页面的视图里：窗口显示的是 `rootViewController` 这个页面的根视图，见 [`UIViewController`](ui-view-controller.md) 和 [`UIView`](ui-view.md)。

## 一个 App 要几个窗口

一个场景一个窗口就够。iPhone 上通常只有一个场景，所以整个 App 通常只有一个窗口。页面之间的切换不靠换窗口，靠换根页面、[导航栈](ui-navigation-controller.md)、[标签栏](ui-tab-bar-controller.md)和[模态呈现](ui-view-controller.md#模态呈现)，它们都发生在同一个窗口里面。

同一个场景里可以建多个窗口。它适用于一种情况：要有一层内容始终盖在所有页面之上，包括模态弹出的页面，比如全局的提示条。写法见[让一个窗口显示在另一个窗口上面](#让一个窗口显示在另一个窗口上面)。多个窗口的行为**未在模拟器验证**：验收用例只有一个显示的窗口。

## 窗口要不要保存

**不要把窗口保存到 `sceneconnect` 的回调外面。** 窗口建在场景上之后由场景保管：场景在，窗口就不会被回收，它的根页面和页面上的所有视图也不会被回收。回调结束、`win` 这个局部变量不存在了，窗口照常显示。

场景被系统销毁时，窗口、页面和所有视图一起被回收，内存还给系统。之后系统创建新的场景，再派发一次 `sceneconnect`，回调重新建一个窗口。所以回调里的代码要能重复执行。

把窗口保存在回调外面的变量里，场景销毁后这个窗口和它里面的全部界面都留在内存里，而它已经不再显示。完整的说明和推荐写法见 [`UIWindowScene`](ui-window-scene.md#推荐的做法)，例子见[不用自己保存窗口的引用](#不用自己保存窗口的引用)。

## 完整例子

下面的代码从空白 App 开始，让屏幕上出现一个窗口和一个有底色的页面。每个 App 都以这几行开头。

```js
// 1. 等系统把场景交过来
application.addEventListener('sceneconnect', (e) => {
  // 2. 在这个场景里建一个窗口
  const win = new UIWindow(e.scene);

  // 3. 建一个页面
  const page = new UIViewController();

  // 4. 给页面设底色
  page.view.backgroundColor = 'systemBackground';

  // 5. 把页面设为窗口的根页面
  win.rootViewController = page;

  // 6. 显示窗口
  win.makeKeyAndVisible();
});
```

**效果**

- 屏幕从黑色变成系统背景色：浅色模式下是白色，深色模式下是黑色。
- 屏幕上没有其他内容。之后的界面都加在 `page.view` 上。

六步各自的作用，以及少了会怎样：

| 步骤 | 作用 | 少了会怎样 |
| --- | --- | --- |
| 1. 监听 `sceneconnect` | 拿到场景。`main.js` 开始执行时场景还没有接入，`application.scenes` 是空数组 | 没有场景，窗口无法创建。原因见[为什么要等 `sceneconnect`](#为什么要等-sceneconnect) |
| 2. `new UIWindow(e.scene)` | 创建窗口并放进场景。此时窗口是隐藏的，`win.isHidden` 是 `true` | 没有窗口，后面几步都没有对象可用 |
| 3. `new UIViewController()` | 创建一个页面。页面（view controller）管理一整屏的内容，它的 `view` 属性是这一屏的根视图 | 窗口没有内容可以显示 |
| 4. 设 `backgroundColor` | 给页面的根视图设底色。`'systemBackground'` 是系统背景色，会跟随深色模式变化，见[颜色](ui-color.md) | 页面的根视图是透明的，屏幕仍然是黑的。**未在模拟器验证** |
| 5. 设 `rootViewController` | 把页面交给窗口。根页面（root view controller）是窗口内容的唯一入口，窗口显示的就是它的 `view` | 窗口没有内容，屏幕是黑的。不报错。**未在模拟器验证** |
| 6. `makeKeyAndVisible()` | 显示窗口，并让它成为 [key window](#key-window) | 屏幕全黑。前五步都做对了也一样。不报错 |

第 5 步和第 6 步的先后可以调换：先显示窗口再设根页面，**未在模拟器验证**。按表里的顺序写。

> **注意**：第 6 步最容易漏。漏了之后窗口已经在场景里，`rootViewController` 也读得到，`win.isHidden` 是 `true`，屏幕是黑的，没有任何报错。

> **注意**：`sceneconnect` 的回调可能执行不止一次。场景被系统销毁后，系统会创建新的场景并再派发一次。回调里的代码要能重复执行，见 [`UIWindowScene`](ui-window-scene.md#推荐的做法)。

回调结束后，`win` 和 `page` 两个局部变量不再存在，窗口继续显示。不需要把它们保存到别处，见[窗口要不要保存](#窗口要不要保存)。

## 常见用法

以下例子都写在 `sceneconnect` 的回调里，沿用上面的 `e`、`win` 和 `page`。

### 在窗口显示出来时执行代码

监听窗口的事件。监听器要在 `makeKeyAndVisible()` 之前注册。事件只表示窗口显示了；页面的内容在调 `makeKeyAndVisible()` 之前就可以加，不需要等这个事件。

```js
win.addEventListener('becomevisible', () => {
  console.log('窗口显示了，isHidden =', win.isHidden);
});
win.addEventListener('becomekey', () => {
  console.log('窗口成为 key window，isKeyWindow =', win.isKeyWindow);
});

win.makeKeyAndVisible();
```

**效果**

- 控制台先输出 `窗口显示了，isHidden = false`。
- 然后输出 `窗口成为 key window，isKeyWindow = true`。

> **注意**：如果先调 `makeKeyAndVisible()` 再注册监听器，这两个事件已经派发过了，回调不会执行。

全部四个事件见[事件](#事件)。

### 先建窗口，之后再放进场景

构造时不传场景，之后给 `windowScene` 赋值。

```js
const later = new UIWindow();
console.log(later.windowScene);   // null

later.windowScene = e.scene;
console.log(later.windowScene === e.scene);   // true
```

**效果**

- 控制台依次输出 `null`、`true`。
- 第一行之后，`later` 这个 JS 对象已经存在，但系统里的窗口还没有创建。
- 给 `windowScene` 赋值的那一刻，系统里的窗口才创建，并放进这个场景。
- 之后 `later` 和用 `new UIWindow(e.scene)` 建出来的窗口用法相同。

赋值之前能做什么、不能做什么，见[两种创建写法](#两种创建写法)。推荐用 `new UIWindow(e.scene)`：在 `sceneconnect` 的回调里场景总是拿得到的。

### 换掉窗口里的整个页面

给 `rootViewController` 赋一个新页面。

```js
const next = new UIViewController();
next.view.backgroundColor = 'systemBlue';
win.rootViewController = next;

console.log(win.rootViewController === next);   // true
```

**效果**

- 屏幕内容从原来的页面换成蓝色的新页面，没有过渡动画。**未在模拟器验证。**
- 读 `rootViewController` 得到刚写入的那个对象。

原来的根页面不再由窗口保管。没有变量保存它时，它和它的视图被回收；这里的 `page` 变量还在，所以它还在，可以之后再设回去。**换下来的页面被回收这一点未在模拟器验证。**

换根页面适用于整个界面切换的场合，比如从登录界面换成主界面。需要带返回按钮的页面跳转时，用 [`UINavigationController`](ui-navigation-controller.md) 做根页面；临时盖一个页面用[模态呈现](ui-view-controller.md#模态呈现)。

### 隐藏窗口

窗口是视图，用视图的 `isHidden` 属性。

```js
win.addEventListener('becomehidden', () => {
  console.log('窗口隐藏了');
});

win.isHidden = true;
```

**效果**

- 窗口和里面的所有内容从屏幕上消失。
- 控制台输出 `窗口隐藏了`。

**这个例子未在模拟器验证。**

把 `isHidden` 设回 `false` 重新显示，派发 `becomevisible`。**未在模拟器验证。**

### 让一个窗口显示在另一个窗口上面

同一个场景里可以有多个窗口。`windowLevel` 大的显示在上面。

```js
const overlay = new UIWindow(e.scene);
const overlayPage = new UIViewController();
overlay.rootViewController = overlayPage;
overlay.windowLevel = 1;
overlay.isHidden = false;
```

**效果**

- `overlay` 显示在 `win` 上面。`win` 的 `windowLevel` 是默认值 `0`。
- `overlayPage.view` 没有设底色，所以透过它能看到下面的 `win`。
- 这里用 `isHidden = false` 而不是 `makeKeyAndVisible()`，所以 `win` 仍然是 key window。

**这个例子未在模拟器验证。**

## 为什么要等 `sceneconnect`

创建能显示的窗口需要场景，而场景在 `main.js` 开始执行时还不存在。

App 启动的顺序是：执行 `main.js` → 系统创建场景并交给 App。所以在 `main.js` 的顶层读 `application.scenes`，得到的是空数组。

```js
console.log(application.scenes.length);   // 0

application.addEventListener('sceneconnect', (e) => {
  console.log(application.scenes[0] === e.scene);   // true
});
```

**效果**：第一行输出 `0`。场景接入后，回调里输出 `true`。

场景创建好之后，`application` 上派发 `sceneconnect` 事件，事件对象的 `scene` 字段就是这个场景。在 `main.js` 的顶层注册监听器，一定来得及收到这个事件。

在 `main.js` 的顶层做不依赖场景的事：注册监听器、准备数据、发网络请求。建界面的代码都写在回调里：保存在回调外面的界面在场景销毁后不会被回收。

## 两种创建写法

| 写法 | 系统里的窗口什么时候创建 | 什么时候用 |
| --- | --- | --- |
| `new UIWindow(scene)` | 立刻 | 手上已经有场景。绝大多数情况用这个 |
| `new UIWindow()`，之后 `win.windowScene = scene` | 给 `windowScene` 赋值时 | 创建窗口的代码拿不到场景，场景由别处稍后提供 |

第二种写法在赋值之前，`win` 只是一个 JS 对象，系统里没有对应的窗口。这时：

- 读 `windowScene` 得到 `null`。
- 其他属性和方法都不能用，访问就抛 `TypeError`。

```js
const lazy = new UIWindow();

console.log(lazy.windowScene);   // null

try {
  lazy.makeKeyAndVisible();
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台先输出 `null`，再输出

```
TypeError: makeKeyAndVisible(): this object is not connected to a scene yet, so no native object exists
```

报错信息开头是被访问的成员名。读 `rootViewController` 时报的是 `rootViewController: this object is not connected to a scene yet, so no native object exists`。

给 `windowScene` 赋值之后，这些成员就都能用了。

## 不用自己保存窗口的引用

窗口建在场景上之后，由场景保管。App 的代码不需要、也不应该把 `win` 存到回调外面的变量里。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
  // 回调结束，win 和 page 这两个局部变量都没有了
});
```

**效果**：回调结束后窗口继续显示。窗口、根页面、页面上的所有视图都不会被回收。

保管关系是一条链：场景保管窗口，窗口保管根页面，页面保管根视图，视图保管子视图。在这条链上的对象都不会被回收，挂在它们上面的事件监听器和自定义属性也都保留。

这条链的起点是场景，所以它们的存在时间和场景相同：

- 场景在的时候，不需要任何变量保存它们。
- 场景被系统销毁时，整条链一起被回收。前提是 App 的代码没有把其中某个对象保存在回调外面。
- 新的场景来了，`sceneconnect` 的回调再执行一次，建出新的一套。

要保存到回调外面的是数据，不是窗口和页面。写法见 [`UIWindowScene`](ui-window-scene.md#推荐的做法)。

之后要再拿到这个窗口，可以从它里面的任何一个视图读 `view.window`。读到的和当初创建的是同一个对象。

## key window

同一时刻，一个场景里最多有一个窗口是 key window：键盘输入等不带位置的输入事件交给它。触摸事件有位置，交给手指所在的窗口，和 key window 无关。

以上是 iOS 的规则。验收用例只有一个窗口，多个窗口之间的输入分配**未在模拟器验证**。

- 只有一个窗口的 App，调一次 `makeKeyAndVisible()` 就够了，之后不用再管。
- 有多个窗口时，用 `makeKeyWindow()` 指定哪一个是 key window。
- 读 `isKeyWindow` 知道某个窗口当前是不是。它变化时派发 `becomekey` 或 `resignkey`。

## 成员说明

`UIWindow` 的继承关系：

```
EventTarget → NSObject → UIResponder → UIView → UIWindow
```

从 [`UIView`](ui-view.md) 继承的成员（`isHidden`、`frame`、`subviews`、`addSubview()` 等）都能用，这里不重复列。其中 `overrideUserInterfaceStyle` 写在窗口上时，对窗口里的全部内容生效，见[外观特征](ui-trait-collection.md)。

窗口的 `frame` 由系统设定，不要写它。界面内容加在根页面的视图上，不要直接 `addSubview()` 到窗口上：直接加在窗口上的视图不属于任何页面。

### 创建

#### `new UIWindow(scene?)`

创建一个窗口。

```js
const win = new UIWindow(e.scene);
```

- **`scene`**：[`UIWindowScene`](ui-window-scene.md)，可选。传了就立刻创建并放进这个场景。不传、传 `null` 或 `undefined`，就先只建 JS 对象，见[两种创建写法](#两种创建写法)。
- **返回**：新建的 `UIWindow`。刚建好时是隐藏的，`isHidden` 是 `true`。
- 传入一个已经被系统销毁的场景时不报错，但建出的窗口不会显示，见 [`UIWindowScene`](ui-window-scene.md)。**未在模拟器验证。**
- **出错**：
  - `scene` 不是场景对象（数字、字符串、别的原生对象）：`TypeError: cannot construct UIWindow with these arguments`
  - 继承 `UIWindow` 再构造：`TypeError: Illegal constructor: MyWindow extends UIWindow, but subclassing native classes is not supported yet`（`MyWindow` 是子类的名字）。原因见[原生类](native-classes.md)

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `windowScene` | [`UIWindowScene`](ui-window-scene.md) 或 `null` | 是 | 是 | 构造时传入的场景，没传是 `null` | 窗口所在的场景。第一次赋值时创建系统里的窗口。之后再赋另一个场景，窗口移到那个场景显示 |
| `rootViewController` | [`UIViewController`](ui-view-controller.md) 或 `null` | 是 | 是 | `null` | 根页面。窗口显示的是它的 `view`。写 `null` 清空窗口的内容 |
| `windowLevel` | 数字，表示层级，没有单位 | 是 | 是 | `0` | 同一场景里多个窗口的上下顺序。数值大的显示在上面。系统键盘和系统弹窗所在的窗口层级更高。只有一个窗口时不需要设 |
| `isKeyWindow` | 布尔 | 是 | 否 | — | `true`：这个窗口是 [key window](#key-window)。`false`：不是。调 `makeKeyAndVisible()` 之后是 `true`。变化时派发 `becomekey` / `resignkey` |
| `canBecomeKeyWindow` | 布尔 | 是 | 否 | — | `true`：这个窗口可以成为 key window。`false`：不可以，对它调 `makeKeyWindow()` 不起作用。这个值由系统决定，不会变化，所以没有变化事件 |

- `windowScene` 和 `rootViewController` 读出来的是写进去的同一个对象，可以用 `===` 比较。
- `windowScene` 和 `rootViewController` 的变化只可能来自你自己的赋值，所以没有变化事件。
- `windowLevel` 没有变化事件，原因相同。
- 除 `windowScene` 外，其余属性在窗口还没放进场景时访问会抛 `TypeError`，见[两种创建写法](#两种创建写法)。
- `windowLevel` 写入时按 `Number()` 转换。转不出有限的数时抛 `TypeError: windowLevel must be a finite number, got "top"`（`got` 后面是收到的值），原值不变。
- **出错**：
  - `rootViewController` 写入的原生对象不是页面：`TypeError: rootViewController needs a UIViewController or null`
  - `rootViewController` 写入的不是原生对象（字符串、数字、普通对象）：`TypeError: rootViewController needs a native object or null, got "home"`（`got` 后面是收到的值）
  - `windowScene` 同理，要求的类是 `UIWindowScene`
  - 出错时属性保持原值。
- 以下几条**未在模拟器验证**：把已经在场景里的窗口移到另一个场景；把 `windowScene` 写成 `null`；把 `rootViewController` 写成 `null`；`canBecomeKeyWindow` 的实际取值。

可见性用继承来的 `isHidden`：

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `isHidden` | 布尔 | 是 | 是 | `true` | `true`：窗口隐藏，里面的内容都不显示。`false`：窗口显示。变化时派发 `becomehidden` / `becomevisible` |

> **注意**：窗口的 `isHidden` 默认是 `true`，普通视图的默认是 `false`。

### 方法

| 方法 | 做什么 |
| --- | --- |
| `makeKeyAndVisible()` | 显示窗口，并让它成为 key window |
| `makeKeyWindow()` | 只让它成为 key window，不改变是否显示。**未在模拟器验证** |

```js
win.makeKeyAndVisible();
```

- **参数**：无。
- **返回**：无。
- **出错**：窗口还没放进场景时抛 `TypeError: makeKeyAndVisible(): this object is not connected to a scene yet, so no native object exists`。`makeKeyWindow()` 的报错信息开头换成 `makeKeyWindow()`。

`makeKeyAndVisible()` 执行后，依次派发 `becomevisible` 和 `becomekey`。**这两个事件的先后顺序未在模拟器验证。**

对已经显示的窗口再调一次 `makeKeyAndVisible()` 的结果，**未在模拟器验证**。

### 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 | 对应的属性 |
| --- | --- | --- |
| `becomevisible` | 窗口从隐藏变为显示 | `isHidden` 变为 `false` |
| `becomehidden` | 窗口从显示变为隐藏 | `isHidden` 变为 `true` |
| `becomekey` | 窗口成为 key window | `isKeyWindow` 变为 `true` |
| `resignkey` | 窗口不再是 key window | `isKeyWindow` 变为 `false` |

```js
win.addEventListener('becomekey', (event) => {
  console.log(event.type, event.target === win);   // becomekey true
});
win.makeKeyAndVisible();
```

**效果**：窗口显示后，控制台输出 `becomekey true`。

- 事件对象只有 `type` 和 `target` 两个字段。`target` 是这个窗口。
- 事件不能取消，`preventDefault()` 不起作用。
- **监听器要在 `makeKeyAndVisible()` 之前注册。** 之后注册的收不到已经派发过的事件。
- **回调不是在变化发生的那一刻同步执行**，而是稍后执行，见[运行时怎么工作](how-it-works.md)。所以回调里读到的属性是执行回调时的值，不是事件发生时的值。实测：`becomevisible` 的回调里，`isKeyWindow` 已经是 `true`，因为那时窗口也已经成为 key window 了。
- 事件只派发给发生变化的那个窗口，不会传给别的对象。
- 窗口是视图，所以也派发 `traitchange`，见[外观特征](ui-trait-collection.md)。
- `becomehidden` 和 `resignkey` 的派发**未在模拟器验证**。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UIWindow alloc] initWithWindowScene:scene]` | `new UIWindow(scene)` |
| `win.windowScene = scene` | `win.windowScene = scene` |
| `win.rootViewController = vc` | `win.rootViewController = vc` |
| `win.windowLevel = UIWindowLevelNormal` | `win.windowLevel = 0` |
| `[win makeKeyAndVisible]` | `win.makeKeyAndVisible()` |
| `[win makeKeyWindow]` | `win.makeKeyWindow()` |
| `win.isKeyWindow` | `win.isKeyWindow` |
| `win.hidden = NO` | `win.isHidden = false` |
| `UIWindowDidBecomeKeyNotification` | `win.addEventListener('becomekey', …)` |
| `UIWindowDidResignKeyNotification` | `win.addEventListener('resignkey', …)` |
| `UIWindowDidBecomeVisibleNotification` | `win.addEventListener('becomevisible', …)` |
| `UIWindowDidBecomeHiddenNotification` | `win.addEventListener('becomehidden', …)` |
| `- (void)scene:willConnectToSession:options:`（在 `SceneDelegate` 里建窗口） | `application.addEventListener('sceneconnect', …)` |

三处和原生不一样：

- `init` 和 `initWithFrame:` 没有对应的写法。它们在 iOS 26 已废弃，创建窗口只能通过场景。
- `becomeKeyWindow` 和 `resignKeyWindow` 没有对应的方法。在 ObjC 里它们是系统通知窗口用的，不是让你调用的。要让窗口成为 key window 用 `makeKeyWindow()`，要得知变化用 `becomekey` / `resignkey` 事件。
- 原生代码要用一个属性保存窗口，否则窗口会被释放。JS 里不需要，也不推荐，见[不用自己保存窗口的引用](#不用自己保存窗口的引用)。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 列出一个场景里的所有窗口，或拿到场景当前的 key window | `UIWindowScene.windows`、`keyWindow` | 未实现 |
| 读窗口所在屏幕的尺寸和缩放比例 | `UIWindow.screen`（`UIScreen`） | 未实现 |
| 继承 `UIWindow`，接管触摸事件的分发 | 子类化、`sendEvent:` | 未实现。`sendEvent:` 不计划暴露 |

## 参见

- [`UIWindowScene`](ui-window-scene.md)：场景，窗口放在它里面
- [`application`](application.md)：`sceneconnect` 事件在它上面派发
- [`UIViewController`](ui-view-controller.md)：`rootViewController` 的类型
- [`UIView`](ui-view.md)：窗口的父类，`isHidden` 等继承来的成员
- [`UINavigationController`](ui-navigation-controller.md)：需要页面跳转时用它做根页面
- [颜色](ui-color.md)：`'systemBackground'` 这类颜色的写法
- [原生类](native-classes.md)：为什么不能继承，以及几种「没有原生对象」的报错
- [外观特征](ui-trait-collection.md)：让整个窗口强制用浅色或深色
- [实现原理：包装机制](../internals/wrapper.md)：窗口为什么不会被回收
- [实现原理：事件](../internals/events.md)：事件为什么稍后派发
