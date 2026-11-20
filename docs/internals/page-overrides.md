# 页面的覆写点：方向和状态栏

← [实现原理](README.md)

页面的 `supportedInterfaceOrientations`、`preferredInterfaceOrientationForPresentation`、`prefersInterfaceOrientationLocked`、`prefersStatusBarHidden`、`preferredStatusBarStyle`；场景的 `effectiveGeometry`、`statusBarManager`、`requestGeometryUpdateWithPreferences()`、`geometrychange`；配置的 `ios.orientations`。2026-11-19 到 20 做的，起因是客户要「K 线全屏转横屏」。

## 先分清哪些是覆写点

按「UIKit 用什么能力解决、我们有没有」列出来，横竖屏和状态栏要的东西分两类：

- **普通的属性、方法、回调**：`effectiveGeometry`、`requestGeometryUpdateWithPreferences:`、场景委托的 `windowScene:didUpdateEffectiveGeometry:`、`statusBarManager`。照规矩接。
- **只能靠子类覆写拿到的**：页面的那五个 getter。UIKit 的形状就是「写一个 `UIViewController` 的子类，覆写 getter」。这一类要定怎么接。

## 覆写点：试过三条路，定了预置子类

| | 做法 | 结果 |
| --- | --- | --- |
| 1 | 替换 `UIViewController` 基类上的 getter（和出现、消失那样） | 方向能用，**状态栏不行** |
| 2 | 写入时把这个页面换成运行时生成的子类（KVO 的做法） | 没做：在 1 的基础上继续绕，越绕越深 |
| 3 | **原生预置子类**：`NacreViewController`、`NacreNavigationController`、`NacreTabBarController`，`new` 这三种页面时造的是它们 | 定了这条 |

**1 为什么不行**：实测（模拟器，在替换的实现里打日志，测完删了）——根页面设了 `prefersStatusBarHidden = true` 并调了 `setNeedsStatusBarAppearanceUpdate`，系统反复问根页面的 `childViewControllerForStatusBarHidden`（返回空，意思是「你自己决定」），**一次都没调它的 `prefersStatusBarHidden`**。UIKit 对状态栏会先看页面的类有没有自己覆写这个 getter，没覆写就按默认处理。替换的是基类本身，在它看来就是没覆写。方向那几个没有这个检查：根页面只允许竖屏时请求横屏会被拒，说明系统问到了。

**3 为什么合适**：预置子类是真的覆写，UIKit 怎么检查都成立。它只覆盖 JS `new` 出来的三种页面——这和原生一致：原生开发者也只能覆写自己写的子类，系统的弹窗、分享面板、选图、拍照这些专用页面，原生里也改不了它们的方向和状态栏。所以在这些页面上设这几个属性抛 `TypeError`，不假装生效。

更通用的做法是让 JS 真的继承原生类、按 JS 的子类在原生层生成子类（M2）。它能覆写任意方法，但要处理动态生成类、任意方法的签名、JS 对象和原生对象同生共死、`super` 调用。为了五个 getter 不做那么大的机制。预置子类不适合的场合是 UIKit 按「有没有覆写」决定要不要调用、而一直覆写着又有代价的方法，典型的是 `drawRect:`（覆写了才分配画布），那种要等 M2。

这五个属性用的是项目里早就定过的那条：**系统要同步返回值，就转成 JS 预先声明的状态**（用户通知的 `foregroundPresentationOptions`、滚动、导航都用过）。系统来问时直接拿存的值回答，不进 JS。

页面在 JS 里设过的值存在原生对象的关联对象上，子类的 getter 先看它，没有就调 `super`。所以没设过值的页面和原生的页面行为完全一样。值不在 JS 对象上，不涉及包装的生命周期。

## 场景这一侧的实测

模拟器（iPhone Air，iOS 27.2），用代码请求转屏（`requestGeometryUpdateWithPreferences:`），探针测完删了：

| 请求 | 系统的回应 |
| --- | --- |
| 不支持的方向（倒竖；或者页面只允许竖屏时请求横屏） | **当场**调出错回调，请求还没返回就调了：`None of the requested orientations are supported by the view controller. …`，`UISceneErrorDomain` 101 |
| 支持的方向 | 不调任何回调；约 0.5 秒后场景的几何变化回调到了 |
| 已经是这个方向 / 空的方向集合 | 什么都不来 |

所以 JS 的 Promise 定成和 Web 的 `screen.orientation.lock()` 一样：已经是要的方向当场兑现；被拒（出错回调当场来，原生同步取得到）就拒绝；否则等 `geometrychange` 把方向变成要的那个再兑现。空集合当场抛 `TypeError`。出错回调万一以后变成晚一点才调，原生只记一行日志。

**转屏时哪个时机在动画里**（在各个回调里当场挪一个视图，看图层上有没有挂上动画）：

| 回调 | 在转屏动画里 | 那一刻视图的大小 |
| --- | --- | --- |
| 页面的 `viewWillTransitionToSize:withTransitionCoordinator:` 当场 | 否 | 旧的 |
| 转屏协调器的 `animateAlongsideTransition` | 是，0.3 秒 | 新的 |
| **场景委托的 `windowScene:didUpdateEffectiveGeometry:`** | **是，0.3 秒** | 新的 |
| 延后一轮、转完之后 | 否 | 新的 |

所以 `geometrychange` 当场派发（`NacreEmitEventNow`，和键盘的三个事件一样），监听器里改的布局跟着屏幕转。

场景委托的方法要在**场景接入之前**补上：实测接入时（`UISceneWillConnectNotification`）才补，系统一直不来调。所以在域的 `+load` 里按 Info.plist 写的委托类名补，委托自己实现了的先调它的。

**布局时机**（这次讨论里顺带测的，没做成能力）：系统引起的重新布局里，`layoutSubviews` 之后和 `layer.bounds` 的 KVO 这两个时机，转屏和键盘弹出时都在动画里；键盘收起那次的布局不在动画里。讨论过做一个视图上的 `resize` 事件，没做：挂在每个视图上影响面太大。

## 配置的 `ios.orientations`

原来 CLI 把 `UISupportedInterfaceOrientations` 写死成只有竖屏，`ios.infoPlist` 里再写一份会生成两个同名的键。改成专门的配置项：名字和页面的 `supportedInterfaceOrientations` 一样（认合称），不写是竖屏，`UISupportedInterfaceOrientations` 成了保留键。理由是 project.md 原则 12：用户不该自己把 `'landscape'` 换算成 `UIInterfaceOrientationLandscapeLeft` 那串常量。

验收 App 声明了横屏，根页面在建窗口那一步就设成只允许竖屏，免得模拟器横着放时整个验收跟着转；只有这一步临时放开。

## 容器里的页面

- **方向**：窗口的根页面是导航控制器时（完整跑验收时就是这样），设在导航控制器上，请求转屏按它的值被允许或拒绝。系统问的是容器。
- **状态栏**：全屏弹出一个导航控制器，在导航控制器上设 `prefersStatusBarHidden = true`，状态栏藏起来；不在它上面设、设在它显示的页面上，也藏起来。也就是导航控制器设了值就以它为准（预置子类的 getter 先看自己存的值），没设就调父类的实现，而 UIKit 的导航控制器的实现会去听当前显示的页面。
- 第一版用例在「窗口的根页面」上测状态栏，单独跑这一步时根页面是普通页面，过了；完整跑时根页面被导航那一步换成了导航控制器，用例就没过。改成全屏弹出一个自己的页面来测，不依赖根页面。

## 实测的默认值

- 页面默认的 `supportedInterfaceOrientations` 是**四个方向**都有（含倒竖）。Apple 的文档写 iPhone 上默认不含倒竖，和实测不符。
- `preferredInterfaceOrientationForPresentation` 默认 `portrait`。

## 没验的

- `preferredInterfaceOrientationForPresentation`、`prefersInterfaceOrientationLocked` 设了之后的效果。
- 真机上转屏、`geometrychange` 在动画里。
- `statusBarFrame` 的具体值、状态栏藏起来时的高度。
