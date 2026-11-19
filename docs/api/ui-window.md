---
type: reference
native: UIWindow
status: partial
---

# `UIWindow`

**`UIWindow`** 表示窗口：一个场景里承载界面的最外层视图。页面和视图要放进窗口才能显示，窗口不显示，里面的内容就都不显示。

窗口建在场景上。场景（[`UIWindowScene`](ui-window-scene.md)）表示 App 界面的一个实例，由系统创建：没有场景就建不出能显示的窗口。系统创建好场景后在 [`application`](application.md) 上派发 [`sceneconnect`](application/sceneconnect-event.md) 事件，建窗口的代码写在这个事件的回调里。

窗口由 App 的代码创建，系统不替 App 建。App 启动后一个窗口都没有，屏幕是黑的，直到代码建出窗口并让它显示。新建的窗口是隐藏的，调 [`makeKeyAndVisible()`](ui-window/makekeyandvisible.md) 才显示。

窗口自己不负责排版。它的位置和大小由系统按场景设定，不需要设 `frame`。界面内容不直接加在窗口上，而是放在根页面的视图里：窗口显示的是 [`rootViewController`](ui-window/rootviewcontroller.md) 这个页面的根视图，见 [`UIViewController`](ui-view-controller.md)。直接 `addSubview()` 到窗口上的视图不属于任何页面。

一个场景一个窗口就够。iPhone 上通常只有一个场景，所以整个 App 通常只有一个窗口。页面之间的切换不靠换窗口，靠换根页面、[导航栈](ui-navigation-controller.md)、[标签栏](ui-tab-bar-controller.md)和[模态呈现](ui-view-controller.md#模态呈现)。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIWindow`

怎么建第一个窗口、场景重建时怎么办，见指南[建窗口和处理场景](../guides/scenes-and-windows.md)。

## 构造函数

[`UIWindow()`](ui-window/constructor.md)

创建一个窗口。传了场景就立刻放进场景；不传就先只有 JS 对象，等给 `windowScene` 赋值时再创建。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。窗口最常用的继承属性是 `isHidden`：它决定窗口显不显示，**窗口的 `isHidden` 默认是 `true`**，普通视图的默认是 `false`。`overrideUserInterfaceStyle` 写在窗口上时，对窗口里的全部内容生效，见[外观特征](ui-trait-collection.md)。窗口的 `frame` 由系统设定，不要写它。

| 属性 | 说明 |
| --- | --- |
| [`windowScene`](ui-window/windowscene.md) | 窗口所在的场景 |
| [`rootViewController`](ui-window/rootviewcontroller.md) | 根页面。窗口显示的是它的 `view` |
| [`windowLevel`](ui-window/windowlevel.md) | 同一场景里多个窗口的上下顺序 |
| [`isKeyWindow`](ui-window/iskeywindow.md) <small>只读</small> | 这个窗口是不是 key window |
| [`canBecomeKeyWindow`](ui-window/canbecomekeywindow.md) <small>只读</small> | 这个窗口能不能成为 key window |

## 实例方法

还继承 [`UIView`](ui-view.md) 的方法。

| 方法 | 说明 |
| --- | --- |
| [`makeKeyAndVisible()`](ui-window/makekeyandvisible.md) | 显示窗口，并让它成为 key window |
| [`makeKeyWindow()`](ui-window/makekeywindow.md) | 只让它成为 key window，不改变是否显示 |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`becomevisible`](ui-window/becomevisible-event.md) | 窗口从隐藏变为显示 |
| [`becomehidden`](ui-window/becomehidden-event.md) | 窗口从显示变为隐藏 |
| [`becomekey`](ui-window/becomekey-event.md) | 窗口成为 key window |
| [`resignkey`](ui-window/resignkey-event.md) | 窗口不再是 key window |
| `traitchange` | 继承自 [`UIView`](ui-view.md)：外观特征变了，见[外观特征](ui-trait-collection.md) |

- **监听器要在 `makeKeyAndVisible()` 之前注册。** 之后注册的收不到已经派发过的事件。
- 事件不能取消。回调不是在变化发生的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md)。
- 事件只派发给发生变化的那个窗口，不会传给别的对象。

## 窗口由谁保管

窗口建在场景上之后由场景保管。保管关系是一条链：场景保管窗口，窗口保管根页面，页面保管根视图，视图保管子视图。在这条链上的对象都不会被回收，挂在它们上面的事件监听器和自定义属性也都保留。`sceneconnect` 的回调结束、`win` 这个局部变量不存在了，窗口照常显示。

这条链的起点是场景，所以它们的存在时间和场景相同：

- 场景在的时候，不需要任何变量保存它们。
- 场景被系统销毁时，整条链一起被回收。前提是 App 的代码没有把其中某个对象保存在回调外面。
- 新的场景来了，`sceneconnect` 的回调再执行一次，建出新的一套。

之后要再拿到这个窗口，可以从它里面的任何一个视图读 `view.window`。读到的和当初创建的是同一个对象。

## key window

同一时刻，一个场景里最多有一个窗口是 key window：键盘输入等不带位置的输入事件交给它。触摸事件有位置，交给手指所在的窗口，和 key window 无关。

以上是 iOS 的规则。验收用例只有一个窗口，多个窗口之间的输入分配**未在模拟器验证**。

- 只有一个窗口的 App，调一次 `makeKeyAndVisible()` 就够了，之后不用再管。
- 有多个窗口时，用 `makeKeyWindow()` 指定哪一个是 key window。
- 读 `isKeyWindow` 知道某个窗口当前是不是。它变化时派发 `becomekey` 或 `resignkey`。

## 示例

### 第一个窗口

从空白 App 开始，让屏幕上出现一个窗口和一个有底色的页面。每个 App 都以这几行开头。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
});
```

**效果**

- 屏幕从黑色变成系统背景色：浅色模式下是白色，深色模式下是黑色。
- 屏幕上没有其他内容。之后的界面都加在 `page.view` 上。

每一步的作用和少了会怎样，见指南[建窗口和处理场景](../guides/scenes-and-windows.md#第一个窗口)。

## 对应的 iOS API

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
- `becomeKeyWindow` 和 `resignKeyWindow` 没有对应的方法。在 ObjC 里它们是系统通知窗口用的，不是让 App 调用的。要让窗口成为 key window 用 `makeKeyWindow()`，要得知变化用 `becomekey` / `resignkey` 事件。
- 原生代码要用一个属性保存窗口，否则窗口会被释放。JS 里不需要，也不推荐。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 列出一个场景里的所有窗口，或拿到场景当前的 key window | `UIWindowScene.windows`、`keyWindow` |
| 继承 `UIWindow`，接管触摸事件的分发 | 子类化、`sendEvent:`。`sendEvent:` 不计划提供 |

## 参见

- [建窗口和处理场景](../guides/scenes-and-windows.md)：第一个窗口、换根页面、隐藏窗口、叠加窗口、场景重建
- [`UIWindowScene`](ui-window-scene.md)：场景，窗口放在它里面
- [`application`](application.md)：`sceneconnect` 事件在它上面派发
- [`UIViewController`](ui-view-controller.md)：`rootViewController` 的类型
- [`UIView`](ui-view.md)：窗口的父类，`isHidden` 等继承来的成员
- [原生类](native-classes.md)：为什么不能继承，以及几种「没有原生对象」的报错
- [实现原理：包装机制](../internals/wrapper.md)：窗口为什么不会被回收
- [实现原理：事件](../internals/events.md)：事件为什么稍后派发
