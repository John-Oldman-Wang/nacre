---
type: reference
native: UIWindowScene
status: partial
---

# `UIWindowScene`

`UIWindowScene` 是场景（scene）：App 的一个界面实例。系统创建它，把它交给你的代码，你在它上面建窗口、放页面。

它大致相当于浏览器里的一个标签页，有四点不同：

- iPhone 上一个 App 通常只有一个场景。多个场景主要出现在 iPad 的多窗口和外接显示器上。
- 场景不能自己创建。它由系统创建，通过 `application` 的 `sceneconnect` 事件交给你。
- 场景自己不显示任何东西。要先在场景上建一个窗口（[`UIWindow`](ui-window.md)），再给窗口设置页面。
- 前后台变化类似 Web 的 `visibilitychange`，但状态不止「可见 / 不可见」两种，见[激活状态](#激活状态)。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[每个成员的说明](#成员说明)。

## 完整例子

下面的代码从空白 App 开始：拿到场景，在场景上建窗口和页面，然后监听场景的状态变化，每次变化在控制台输出一行。

```js
// 1. 场景由系统创建，从 sceneconnect 事件里拿到
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;

  // 2. 在场景上建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 3. 监听这个场景的四个状态变化事件
  for (const type of ['active', 'inactive', 'foreground', 'background']) {
    scene.addEventListener(type, (ev) => {
      console.log('场景事件:', ev.type, '| 状态:', scene.activationState);
    });
  }
});
```

**效果**

- 屏幕上出现一个空白页面，底色是系统背景色（浅色模式下是白色）。
- 用户按 Home 回到桌面，控制台依次输出 `inactive`、`background` 两条。
- 用户再切回 App，控制台依次输出 `foreground`、`active` 两条。

四条输出的完整内容：

| 顺序 | 输出 | 验证情况 |
| --- | --- | --- |
| 1 | `场景事件: inactive \| 状态: foregroundInactive` | 实测 |
| 2 | `场景事件: background \| 状态: …` | 状态的值**未在模拟器验证** |
| 3 | `场景事件: foreground \| 状态: …` | 状态的值**未在模拟器验证** |
| 4 | `场景事件: active \| 状态: …` | 状态的值**未在模拟器验证** |

`inactive` → `background` → `foreground` → `active` 这个顺序，在 `application` 的同名事件上实测过。场景事件的验收用例监听了这四个事件，但四个事件的先后顺序没有单独记录，**场景事件的顺序未在模拟器验证**。

App 启动时，场景接入之后是否也会输出 `foreground` 和 `active`，**未在模拟器验证**。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 常见用法

以下例子都假设已经有上面的 `scene`、`win` 和 `page`，代码写在 `sceneconnect` 的回调里面。

### 怎么拿到：只能靠事件

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  console.log(scene instanceof UIWindowScene);
});
```

**效果**：场景接入时回调执行，控制台输出 `true`。

监听要在 `main.js` 的顶层注册。`main.js` 执行完之后系统才接入场景，所以顶层注册的监听一定能收到这个事件。

回调可能执行不止一次：场景断开后再接入时，`sceneconnect` 会再派发。回调里的代码要能重复执行，见[场景的接入和断开](#场景的接入和断开)。

> **注意**：不要在 `main.js` 顶层读 `application.scenes[0]`。`main.js` 执行时场景还没有接入，`application.scenes` 是空数组，读到的是 `undefined`。

场景接入之后，也可以从 `application.scenes` 里读到它，和事件里拿到的是同一个对象：

```js
console.log(application.scenes[0] === scene);
```

**效果**：控制台输出 `true`。

### 知道 App 进了后台

「进后台」指用户按 Home 回到桌面，或者切到别的 App。此时界面不再显示，系统随后可能暂停 App 的代码。

```js
scene.addEventListener('inactive', () => {
  console.log('即将离开前台，保存数据');
});

scene.addEventListener('background', () => {
  console.log('已经在后台');
});
```

**效果**：用户按 Home，控制台先输出 `即将离开前台，保存数据`，再输出 `已经在后台`。**两条的先后顺序未在模拟器验证**，见[完整例子](#完整例子)里的说明。

`inactive` 不只在进后台时派发。下拉通知中心、来电这类临时打断也会让场景失去活跃，这时只有 `inactive`，没有 `background`。**临时打断的情况未在模拟器验证。**

### 知道 App 回到了前台

```js
scene.addEventListener('foreground', () => {
  console.log('即将回到前台');
});

scene.addEventListener('active', () => {
  console.log('可以交互了，刷新数据');
});
```

**效果**：用户从桌面切回 App，控制台先输出 `即将回到前台`，再输出 `可以交互了，刷新数据`。**两条的先后顺序未在模拟器验证。**

### 读当前的激活状态

```js
const state = scene.activationState;

if (state === 'foregroundActive') {
  console.log('在前台，可以交互');
} else if (state === 'foregroundInactive') {
  console.log('在前台，暂时不能交互');
} else if (state === 'background') {
  console.log('在后台');
} else {
  console.log('其他状态:', state);
}
```

**效果**：按场景此刻的状态输出其中一行。每个取值的含义见[激活状态](#激活状态)。

`activationState` 没有对应的「值变了」事件名。它变化时派发的是 `active`、`inactive`、`foreground`、`background` 四个事件，在这四个事件的回调里读它即可。

### 拿到这个场景里的所有窗口

场景上列出全部窗口的属性（原生的 `windows`）还没有暴露，见[还不能做的](#还不能做的)。

窗口都是你的代码创建的，所以可以在创建时自己记下来：

```js
/** @type {UIWindow[]} */
const windows = [];

const second = new UIWindow(scene);
windows.push(win, second);

console.log(windows.length);
console.log(second.windowScene === scene);
```

**效果**：控制台输出 `2` 和 `true`。

反方向是可以读的：窗口的 `windowScene` 属性返回它所在的场景。

不记下来窗口也不会消失。窗口绑定到场景之后由场景持有，不需要为了让它存活而保留变量。

### 设置多任务切换器里的标题

多任务切换器是用户从屏幕底部上滑后看到的界面，每个 App 显示为一张卡片。

```js
scene.title = '收件箱';
scene.subtitle = '3 封未读';

console.log(scene.title);
```

**效果**：控制台输出 `收件箱`。**卡片上显示成什么样未在模拟器验证。**

### 记住这个场景上次在看什么

每个场景有一个 [`UISceneSession`](#uiscenesession) 对象，通过 `scene.session` 拿到。它的 `userInfo` 用来存放你自己的数据。

```js
const session = scene.session;

// 读上次存的数据
const info = session.userInfo;
if (info && info.kind === 'mailDetail') {
  console.log('上次在看邮件', info.mailId);
} else {
  console.log('没有记录，显示首页');
}

// 存这次的数据
session.userInfo = { kind: 'mailDetail', mailId: 42 };
```

**效果**：写入之后在同一次运行里读 `session.userInfo`，读到写入的内容。

场景断开再接入、App 被终止后重新打开，`userInfo` 是否还在，**未在模拟器验证**。

> **注意**：`userInfo` 里的值只能是字符串、数字、布尔、数组和普通对象。值里带 `null` 时系统怎么处理，**未在模拟器验证**。

### 用场景打开一个链接

```js
scene.openURL('https://example.com').then((ok) => {
  console.log('打开结果:', ok);
});
```

**效果**：系统用 Safari 打开这个网址，App 进入后台，控制台输出 `打开结果: true`。**这个例子未在模拟器验证。**

验收用例里运行过的是一个没有 App 能处理的地址（`nacre-nonexistent-scheme://test`）：Promise 正常兑现，不抛错，App 留在前台。

## 概念

### 场景不能自己创建

场景由系统创建。`new UIWindowScene()` 会抛错：

```js
try {
  // @ts-expect-error 场景不能构造
  new UIWindowScene();
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: Illegal constructor: UIWindowScene is created by the runtime, not by new`。

拿到场景的途径只有两个：`sceneconnect` 事件的 `e.scene`，和 `application.scenes`。

场景也不能被继承，见[原生类：不能继承](native-classes.md#不能继承)。

### 场景的接入和断开

「接入」指系统创建好场景并交给 App。「断开」指系统把场景收回，比如为了释放内存，或者用户关掉了窗口。

这两件事的事件派发在 `application` 上，不在场景上：

```js
application.addEventListener('sceneconnect', (e) => {
  console.log('接入:', e.scene.session.persistentIdentifier);
});

application.addEventListener('scenedisconnect', (e) => {
  console.log('断开:', e.scene.session.persistentIdentifier);
});
```

**效果**：场景接入时输出一行 `接入: …`。`scenedisconnect` 的派发**未在模拟器验证**。

一次 App 运行期间，`sceneconnect` 可能派发多次。回调里建界面的代码要能重复执行。**多次接入的情况未在模拟器验证。**

### 激活状态

激活状态说的是这个场景此刻是否显示、能否交互。`scene.activationState` 返回下面的值之一：

| 取值 | 含义 |
| --- | --- |
| `'foregroundActive'` | 在前台，正在显示，用户可以交互。App 正常使用时是这个值 |
| `'foregroundInactive'` | 在前台，正在显示，但暂时收不到用户的操作。进后台前和回前台后的短暂过渡期是这个值 |
| `'background'` | 在后台，不显示 |
| `'unattached'` | 场景没有接入 App |
| `'unknown'` | 系统返回了运行时不认识的状态。现有的 iOS 版本不会出现 |

和 Web 的 `document.visibilityState` 对照：`'visible'` 对应前两种，`'hidden'` 对应 `'background'`。iOS 多出的 `'foregroundInactive'` 表示「看得见但不能操作」。

### 场景的状态和 App 的状态

前后台有两套读法和两套事件：

| | 说的是谁 | 读状态 | 事件 |
| --- | --- | --- | --- |
| 场景级 | 这一个场景 | `scene.activationState` | `scene` 上的 `active` / `inactive` / `foreground` / `background` |
| App 级 | 所有场景合起来 | `application.state` | [`application` 上的同名事件](application.md#前后台事件) |

只有一个场景时，两套事件成对出现。

两套状态更新的时刻不同。同样是 `inactive` 事件，实测回调里读到的值：

| 事件 | 回调里读到 |
| --- | --- |
| `scene` 的 `inactive` | `scene.activationState` 是 `'foregroundInactive'`，已经是新值 |
| `application` 的 `inactive` | `application.state` 是 `'active'`，还是旧值 |

要在事件回调里判断「现在是什么状态」，读 `scene.activationState`。

### 同一个场景永远是同一个对象

同一个场景，不管从哪里拿到，在 JS 里都是同一个对象。可以用 `===` 比较：

```js
console.log(application.scenes[0] === scene);
console.log(scene.session === scene.session);
```

**效果**：控制台输出两行 `true`。

所以挂在场景上的事件监听不会丢失。场景上也可以挂自定义属性，从别处读到的是同一份，见[原生类：可以挂自定义属性](native-classes.md#可以挂自定义属性)。

## 成员说明

`UIWindowScene` 的继承关系：

```
EventTarget → NSObject → UIResponder → UIScene → UIWindowScene
```

`UIScene` 是场景的基类，本身没有可用的成员，也不能构造。`new UIScene()` 抛 `TypeError: Illegal constructor: UIScene cannot be constructed`。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `activationState` | `'unattached'` \| `'foregroundActive'` \| `'foregroundInactive'` \| `'background'` \| `'unknown'` | 是 | 否 | 由系统决定 | 这个场景的激活状态。取值见[激活状态](#激活状态)。变化时派发[事件](#事件)里的四个事件 |
| `session` | [`UISceneSession`](#uiscenesession) | 是 | 否 | 由系统决定 | 这个场景的会话对象。同一个场景每次读到的是同一个对象 |
| `isFullScreen` | 布尔 | 是 | 否 | 由系统决定 | `true` 表示场景占满整个屏幕，`false` 表示没有占满。没有变化通知，因为对应的原生事件还没有暴露。**iPhone 上读到的值未记录** |
| `title` | 字符串或 `null` | 是 | 是 | **未记录** | 多任务切换器的卡片上显示的标题。写 `null` 清除。只有你的代码会改它，所以没有变化通知 |
| `subtitle` | 字符串 | 是 | 是 | **未记录** | 多任务切换器的卡片上显示的副标题。写入的值不是字符串时，设为空字符串。只有你的代码会改它，所以没有变化通知 |

写只读属性会抛 `TypeError`。

### 方法

#### `openURL()`

让系统打开一个 URL：跳到 Safari、拨号、跳到别的 App。

```js
scene.openURL('https://example.com').then((ok) => {
  console.log(ok);
});
```

- **参数**：`url`，字符串。传入的值会先转成字符串。
- **返回**：`Promise<boolean>`。系统打开成功时兑现为 `true`。
- **出错**：不抛错，Promise 也不会被拒绝。以下情况兑现为 `false`：
  - `url` 不是合法的 URL。
  - 没有 App 能处理这个 URL，或者系统拒绝打开。**这一条的兑现值未在模拟器验证。**

`application.openURL()` 是 App 级的同名方法，两个都可以用。

### 事件

用 `addEventListener()` 监听，事件派发在场景对象上。

| 事件 | 什么时候派发 | 对应的原生通知 |
| --- | --- | --- |
| `inactive` | 这个场景即将失去活跃：即将进后台，或者被临时打断 | `UISceneWillDeactivateNotification` |
| `background` | 这个场景已经进入后台 | `UISceneDidEnterBackgroundNotification` |
| `foreground` | 这个场景即将回到前台 | `UISceneWillEnterForegroundNotification` |
| `active` | 这个场景已经变为活跃，用户可以交互 | `UISceneDidActivateNotification` |

- 事件对象只有 `type` 和 `target` 两个字段，`target` 是这个场景。
- 事件不能取消，`preventDefault()` 不起作用。
- 回调不是在状态变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md#事件)。
- 场景上也可以监听和派发自定义名字的事件，用法和普通的 `EventTarget` 一样。

场景的接入和断开不在这张表里。它们是 `application` 上的 `sceneconnect` 和 `scenedisconnect`，事件对象多一个 `scene` 字段，见[场景的接入和断开](#场景的接入和断开)。

## `UISceneSession`

`UISceneSession` 是场景的会话：场景的持久身份。场景对象可能被系统销毁后重新创建，会话存在的时间比场景对象长。用它判断「这是一个新的场景」还是「之前的场景又接入了」。

会话通过 `scene.session` 拿到，不能自己创建。`new UISceneSession()` 抛 `TypeError: Illegal constructor: UISceneSession is created by the runtime, not by new`。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `role` | 字符串 | 是 | 否 | 由系统决定 | 场景的用途，值是原生常量的原文。普通的 App 界面是 `'UIWindowSceneSessionRoleApplication'`。不会变，所以没有变化通知 |
| `persistentIdentifier` | 字符串 | 是 | 否 | 由系统决定 | 这个会话的唯一标识。不会变，所以没有变化通知。**场景销毁重建后保持不变这一点未在模拟器验证** |
| `userInfo` | 普通对象或 `null` | 是 | 是 | **未记录** | 你自己的数据，系统负责保存。写 `null` 或者不是普通对象的值时清除。只有你的代码会改它，所以没有变化通知 |

`userInfo` 的用法见[记住这个场景上次在看什么](#记住这个场景上次在看什么)。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `scene:willConnectToSession:options:` / `UISceneWillConnectNotification` | `application.addEventListener('sceneconnect', (e) => { e.scene })` |
| `sceneDidDisconnect:` / `UISceneDidDisconnectNotification` | `application.addEventListener('scenedisconnect', …)` |
| `sceneDidBecomeActive:` / `UISceneDidActivateNotification` | `scene.addEventListener('active', …)` |
| `sceneWillResignActive:` / `UISceneWillDeactivateNotification` | `scene.addEventListener('inactive', …)` |
| `sceneWillEnterForeground:` / `UISceneWillEnterForegroundNotification` | `scene.addEventListener('foreground', …)` |
| `sceneDidEnterBackground:` / `UISceneDidEnterBackgroundNotification` | `scene.addEventListener('background', …)` |
| `UIApplication.sharedApplication.connectedScenes` | `application.scenes` |
| `scene.activationState == UISceneActivationStateForegroundActive` | `scene.activationState === 'foregroundActive'` |
| `[[UIWindow alloc] initWithWindowScene:scene]` | `new UIWindow(scene)` |
| `scene.fullScreen` | `scene.isFullScreen` |
| `scene.title = @"收件箱"` | `scene.title = '收件箱'` |
| `[scene openURL:url options:nil completionHandler:^(BOOL ok){}]` | `await scene.openURL(url)` |
| `scene.session.persistentIdentifier` | `scene.session.persistentIdentifier` |
| `scene.session.userInfo = @{ @"kind": @"mailDetail" }` | `scene.session.userInfo = { kind: 'mailDetail' }` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 列出这个场景里的所有窗口，找到当前接收键盘输入的窗口 | `windows`、`keyWindow` | 未实现 |
| 读当前的屏幕方向（竖屏、横屏） | `effectiveGeometry.interfaceOrientation` | 未实现，[方案已定](../project.md#屏幕方向方案已定未实现) |
| 锁定屏幕方向，只允许竖屏或横屏 | `supportedInterfaceOrientationsForWindowScene:` | 未实现，方案同上 |
| 屏幕方向变化时收到通知 | `windowScene:didUpdateEffectiveGeometry:` | 未实现，方案同上 |
| 读屏幕的大小和像素密度 | `screen` | 未实现 |
| 读深色模式、字体大小等外观设置 | `traitCollection` | 未实现 |
| 限制窗口的最小和最大尺寸，请求改变窗口大小 | `sizeRestrictions`、`requestGeometryUpdate:` | 未实现 |
| 指定哪个场景响应外部事件、场景何时销毁（iPad 多窗口） | `activationConditions`、`destructionConditions` | 未实现 |
| `openURL()` 带选项，比如只允许通用链接 | `openURL:options:completionHandler:` 的 `options` | 未实现 |
| 替换场景的 delegate | `delegate` | 不会提供。它由运行时使用，JS 改它会破坏运行时 |

## 参见

- [`application`](application.md)：`sceneconnect` / `scenedisconnect` 事件、`scenes` 属性和 App 级的前后台事件都在它上面
- [`UIWindow`](ui-window.md)：在场景上建窗口，让界面显示出来
- [`UIViewController`](ui-view-controller.md)：窗口里的页面
- [原生类](native-classes.md)：哪些类能构造、不能继承、能挂自定义属性
- [实现原理：包装机制](../internals/wrapper.md)：同一个场景为什么永远是同一个 JS 对象
- [实现原理：运行时](../internals/runtime.md)：原生通知怎样变成 JS 事件
