---
type: reference
native: UIWindowScene
status: partial
---

# `UIWindowScene`

**`UIWindowScene`** 表示 App 界面的一个实例，称为场景。App 的每个窗口都属于某个场景，场景决定这些窗口显示在哪块屏幕上、此刻在前台还是后台。

场景是界面的前提。窗口（[`UIWindow`](ui-window.md)）要建在场景上才能显示，页面和视图又要放进窗口才能显示。没有场景时 App 的代码照常运行，但屏幕上显示不出任何东西。

场景由系统创建，也由系统销毁，App 不能自己创建。系统创建好一个场景后，在 [`application`](application.md) 上派发 [`sceneconnect`](application/sceneconnect-event.md) 事件，事件对象的 `scene` 属性就是这个场景；收回时派发 [`scenedisconnect`](application/scenedisconnect-event.md)。场景接入之后也能从 [`application.scenes`](application/scenes.md) 读到它。

每个场景有一个会话 [`UISceneSession`](ui-scene-session.md)，从 [`session`](ui-window-scene/session.md) 读到。场景对象可能被系统销毁后重新创建，会话存在的时间比场景对象长，可以用它存这个场景的数据。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → `UIScene` → `UIWindowScene`

`UIScene` 是场景的基类，本身没有可用的成员，也不能构造：`new UIScene()` 抛 `TypeError: Illegal constructor: UIScene cannot be constructed`。

场景被销毁之后界面怎么重建、数据存在哪里，见指南[建窗口和处理场景](../guides/scenes-and-windows.md)。

## 构造函数

不能用 `new` 创建。`new UIWindowScene()` 抛 `TypeError: Illegal constructor: UIWindowScene is created by the runtime, not by new`。拿到场景的途径只有两个：`sceneconnect` 事件的 `e.scene`，和 `application.scenes`。场景也不能被继承，见[原生类：不能继承](native-classes.md#不能继承)。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`activationState`](ui-window-scene/activationstate.md) <small>只读</small> | 这个场景此刻是否显示、能否交互 |
| [`session`](ui-window-scene/session.md) <small>只读</small> | 这个场景的会话：场景的持久身份 |
| [`traitCollection`](ui-window-scene/traitcollection.md) <small>只读</small> | 整个场景的外观特征，比如系统设置里是深色还是浅色 |
| [`isFullScreen`](ui-window-scene/isfullscreen.md) <small>只读</small> | 场景是否占满整个屏幕 |
| [`screen`](ui-window-scene/screen.md) <small>只读</small> | 这个场景显示在哪块屏幕上 |
| [`title`](ui-window-scene/title.md) | 多任务切换器的卡片上显示的标题 |
| [`subtitle`](ui-window-scene/subtitle.md) | 多任务切换器的卡片上显示的副标题 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`openURL()`](ui-window-scene/openurl.md) | 让系统打开一个 URL：跳到 Safari、拨号、跳到别的 App |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`inactive`](ui-window-scene/inactive-event.md) | 这个场景即将失去活跃：即将进后台，或者被临时打断 |
| [`background`](ui-window-scene/background-event.md) | 这个场景已经进入后台 |
| [`foreground`](ui-window-scene/foreground-event.md) | 这个场景即将回到前台 |
| [`active`](ui-window-scene/active-event.md) | 这个场景已经变为活跃，用户可以交互 |
| [`traitchange`](ui-window-scene/traitchange-event.md) | 场景的外观特征变了 |

- 事件不能取消。回调不是在状态变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md#事件)。
- 场景上也可以监听和派发自定义名字的事件，用法和普通的 `EventTarget` 一样。
- 场景的接入和断开不在这张表里：它们是 `application` 上的 `sceneconnect` 和 `scenedisconnect`。

## 场景的数量

一个 App 同时有几个场景，取决于设备：

| 设备 | 场景数量 |
| --- | --- |
| iPhone | 一个。连接了外接显示器时可能多一个 |
| iPad | 用户可以给同一个 App 打开多个窗口，每个窗口是一个场景。各场景的界面和前后台状态互相独立 |

App 是否允许同时有多个场景，读 [`application.supportsMultipleScenes`](application/supportsmultiplescenes.md)。运行时目前只支持 iPhone，iPad 上的多场景**未在模拟器验证**。

## 什么时候没有场景

以下情况下 App 的代码在运行，但没有可用的场景：

- **App 刚启动，脚本顶层执行时。** 系统在脚本执行完之后才创建场景，这时 `application.scenes` 是空数组。所以建界面的代码不能写在顶层，要写在 `sceneconnect` 的回调里。
- **场景被系统销毁之后。** App 进入后台后，系统为了回收内存可以销毁场景，这时在 `application` 上派发 `scenedisconnect`。
- **用户关掉了窗口。** 在 iPad 上，用户可以从多任务界面关闭 App 的某个窗口，对应的场景被销毁。

后两种情况**未在模拟器验证**：验收过程中系统没有销毁过场景。

## 场景被销毁之后

场景被销毁不等于 App 重新启动。App 的进程还在，JS 里的变量、数据、没完成的网络请求都还在。被销毁的只有这个场景和它上面的界面。

销毁之后依次发生这些事：

1. 系统在 `application` 上派发 `scenedisconnect`，事件对象的 `scene` 是被销毁的那个场景。
2. 运行时不再保管这个场景。如果 App 的代码也没有保存它，这个场景连同它的窗口、页面和所有视图都会被回收，内存还给系统。
3. 用户回到 App 时，系统创建一个**新的**场景对象，再派发一次 `sceneconnect`。

新场景和旧场景是两个不同的对象。它们的 `session` 表示同一份界面：`session.persistentIdentifier` 相同，`session.userInfo` 里存的数据还在。以上过程来自运行时的代码和 iOS 的定义，**未在模拟器验证**。

如果 App 的代码把场景保存在了回调外面的变量里，或者挂在了 `application` 这类一直存在的对象上：

- **旧场景不会被释放。** 它的窗口、页面和所有视图也都留在内存里。
- **旧场景已经不能用了。** 屏幕上不再显示它的窗口。在它上面新建窗口也不会显示。读它的 `activationState` 得到 `'unattached'`。
- **不会报错。** 读写旧场景的属性不抛异常，所以这种错误不容易发现。

挂在 `application` 上的后果最重：`application` 在 App 运行期间一直存在，挂在它上面的场景永远不会被释放。场景每被销毁重建一次，就多留下一份。这几条**未在模拟器验证**。

## 场景的状态和 App 的状态

前后台有两套读法和两套事件：

| | 说的是谁 | 读状态 | 事件 |
| --- | --- | --- | --- |
| 场景级 | 这一个场景 | `scene.activationState` | `scene` 上的 `active` / `inactive` / `foreground` / `background` |
| App 级 | 所有场景合起来 | [`application.state`](application/state.md) | `application` 上的同名事件 |

只有一个场景时，两套事件成对出现。两套状态更新的时刻不同。同样是 `inactive` 事件，实测回调里读到的值：

| 事件 | 回调里读到 |
| --- | --- |
| `scene` 的 `inactive` | `scene.activationState` 是 `'foregroundInactive'`，已经是新值 |
| `application` 的 `inactive` | `application.state` 是 `'active'`，还是旧值 |

要在事件回调里判断「现在是什么状态」，读 `scene.activationState`。

## 同一个场景永远是同一个对象

同一个场景，不管从哪里拿到，在 JS 里都是同一个对象，可以用 `===` 比较。所以挂在场景上的事件监听不会丢失。场景上也可以挂自定义属性，从别处读到的是同一份，见[原生类：可以挂自定义属性](native-classes.md#可以挂自定义属性)。

## 示例

### 监听场景的状态变化

从空白 App 开始：拿到场景，在场景上建窗口和页面，然后监听场景的状态变化，每次变化在控制台输出一行。

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;

  const win = new UIWindow(scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

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

第一条的完整内容是 `场景事件: inactive | 状态: foregroundInactive`（实测）；其余三条里状态的值**未在模拟器验证**。`inactive` → `background` → `foreground` → `active` 这个顺序，在 `application` 的同名事件上实测过；场景事件的先后顺序**未在模拟器验证**。App 启动时，场景接入之后是否也会输出 `foreground` 和 `active`，**未在模拟器验证**。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 对应的 iOS API

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

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 列出这个场景里的所有窗口，找到当前接收键盘输入的窗口 | `windows`、`keyWindow` |
| 读当前的屏幕方向（竖屏、横屏） | `effectiveGeometry.interfaceOrientation`。[方案已定](../internals/pending.md#屏幕方向方案已定未实现) |
| 锁定屏幕方向，只允许竖屏或横屏 | `supportedInterfaceOrientationsForWindowScene:`。方案同上 |
| 屏幕方向变化时收到通知 | `windowScene:didUpdateEffectiveGeometry:`。方案同上 |
| 读屏幕的大小和像素密度 | `screen` |
| 限制窗口的最小和最大尺寸，请求改变窗口大小 | `sizeRestrictions`、`requestGeometryUpdate:` |
| 指定哪个场景响应外部事件、场景何时销毁（iPad 多窗口） | `activationConditions`、`destructionConditions` |
| `openURL()` 带选项，比如只允许通用链接 | `openURL:options:completionHandler:` 的 `options` |
| 替换场景的 delegate | `delegate`。不会提供：它由运行时使用，JS 改它会破坏运行时 |

## 参见

- [建窗口和处理场景](../guides/scenes-and-windows.md)：推荐的做法、数据存在哪里、前后台、会话
- [`UISceneSession`](ui-scene-session.md)：场景的会话
- [`application`](application.md)：`sceneconnect` / `scenedisconnect` 事件、`scenes` 属性和 App 级的前后台事件
- [`UIWindow`](ui-window.md)：在场景上建窗口，让界面显示出来
- [原生类](native-classes.md)：哪些类能构造、不能继承、能挂自定义属性
- [实现原理：包装机制](../internals/wrapper.md)：同一个场景为什么永远是同一个 JS 对象
- [实现原理：运行时](../internals/runtime.md)：原生通知怎样变成 JS 事件
