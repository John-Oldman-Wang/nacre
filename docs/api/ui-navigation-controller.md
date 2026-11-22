---
type: reference
native: UINavigationController
status: partial
---

# `UINavigationController`

**`UINavigationController`** 表示一个页面栈，称为导航控制器。它自己是一个页面（[`UIViewController`](ui-view-controller.md)），但不显示自己的内容，而是管理一组页面：栈顶的那个页面显示在屏幕上，其余的页面留在栈里不显示。

对栈有两种操作。**推入**（push）把一个新页面放到栈顶，屏幕切换到新页面。**弹出**（pop）拿走栈顶的页面，屏幕回到它下面的那一页。「列表 → 详情 → 再下一层」这种一层层进入、再一层层返回的界面，用的就是它。

导航控制器在屏幕顶部画一条**导航条**。导航条正中显示栈顶页面的标题；栈里不止一页时，导航条左侧有一个**返回按钮**，上面的字是上一页的标题。导航条、返回按钮和切换页面时的动画都由系统提供。导航条上显示什么由栈顶的页面决定：标题读页面的 [`title`](ui-view-controller/title.md)，按钮读页面的 [`navigationItem`](ui-view-controller/navigationitem.md)，见 [`UINavigationItem`](ui-navigation-item.md)。

它是一个页面，所以 `UIViewController` 的成员它都有：可以做窗口的根页面，可以被模态呈现，也可以放进 [`UITabBarController`](ui-tab-bar-controller.md) 的一个标签里。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UINavigationController`

怎么在页面之间跳转、按路径跳转、在页面离开栈时清理，见指南[在页面之间跳转](../guides/navigation.md)。

## 构造函数

[`UINavigationController()`](ui-navigation-controller/constructor.md)

创建一个导航控制器。可以给一个页面做栈底，也可以是空栈。

## 实例属性

还继承 [`UIViewController`](ui-view-controller.md) 的属性。

| 属性 | 说明 |
| --- | --- |
| [`viewControllers`](ui-navigation-controller/viewcontrollers.md) | 栈里的全部页面，栈底在前 |
| [`topViewController`](ui-navigation-controller/topviewcontroller.md) <small>只读</small> | 栈顶的页面 |
| [`visibleViewController`](ui-navigation-controller/visibleviewcontroller.md) <small>只读</small> | 此刻用户看到的页面 |
| [`isNavigationBarHidden`](ui-navigation-controller/isnavigationbarhidden.md) | 导航条藏不藏 |
| [`isToolbarHidden`](ui-navigation-controller/istoolbarhidden.md) | 底部的工具条藏不藏 |
| [`toolbar`](ui-navigation-controller/toolbar.md) <small>只读</small> | 导航控制器自己管的底部工具条 |
| [`interactivePopGestureRecognizer`](ui-navigation-controller/interactivepopgesturerecognizer.md) <small>只读</small> | 左滑返回的手势。设它的 `isEnabled` 开关左滑返回 |
| [`interactiveContentPopGestureRecognizer`](ui-navigation-controller/interactivecontentpopgesturerecognizer.md) <small>只读</small> | 在内容区任意位置右划返回的手势（iOS 26 起） |
| [`hidesBarsOnSwipe`](ui-navigation-controller/hidesbarsonswipe.md) | 往上划页面时自动藏起导航条 |
| [`hidesBarsOnTap`](ui-navigation-controller/hidesbarsontap.md) | 点一下页面切换导航条的显示 |
| [`hidesBarsWhenKeyboardAppears`](ui-navigation-controller/hidesbarswhenkeyboardappears.md) | 键盘出现时自动藏起导航条 |
| [`hidesBarsWhenVerticallyCompact`](ui-navigation-controller/hidesbarswhenverticallycompact.md) | 屏幕高度紧张时自动藏起导航条 |
| [`barHideOnSwipeGestureRecognizer`](ui-navigation-controller/barhideonswipegesturerecognizer.md) <small>只读</small> | `hidesBarsOnSwipe` 用的手势 |
| [`barHideOnTapGestureRecognizer`](ui-navigation-controller/barhideontapgesturerecognizer.md) <small>只读</small> | `hidesBarsOnTap` 用的手势 |

## 实例方法

还继承 [`UIViewController`](ui-view-controller.md) 的方法。

改栈的方法最后一个参数都是 `{ animated }`，不写时没有动画：

| 方法 | 说明 |
| --- | --- |
| [`pushViewController()`](ui-navigation-controller/pushviewcontroller.md) | 把一个页面推入栈顶 |
| [`popViewController()`](ui-navigation-controller/popviewcontroller.md) | 弹出栈顶的页面 |
| [`popToViewController()`](ui-navigation-controller/poptoviewcontroller.md) | 弹出某一页上面的所有页面 |
| [`popToRootViewController()`](ui-navigation-controller/poptorootviewcontroller.md) | 弹出栈底以外的所有页面 |
| [`setViewControllers()`](ui-navigation-controller/setviewcontrollers.md) | 换掉整个栈 |
| [`showViewController()`](ui-navigation-controller/showviewcontroller.md) | 显示一个页面，等同于带动画的 `pushViewController()` |

导航条：

| 方法 | 说明 |
| --- | --- |
| [`setNavigationBarHidden()`](ui-navigation-controller/setnavigationbarhidden.md) | 藏起或显示导航条，可以带动画 |
| [`setToolbarHidden()`](ui-navigation-controller/settoolbarhidden.md) | 藏起或显示底部的工具条，可以带动画 |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`beforeshow`](ui-navigation-controller/beforeshow-event.md) | 导航控制器即将显示某个页面 |
| [`show`](ui-navigation-controller/show-event.md) | 导航控制器已经显示某个页面，转场动画结束 |
| [`beforeappear`](ui-view-controller/beforeappear-event.md)、[`appear`](ui-view-controller/appear-event.md)、[`beforedisappear`](ui-view-controller/beforedisappear-event.md)、[`disappear`](ui-view-controller/disappear-event.md) | 继承自 [`UIViewController`](ui-view-controller.md)：导航控制器自己的视图出现和消失 |
| [`traitchange`](ui-view-controller/traitchange-event.md) | 继承自 [`UIViewController`](ui-view-controller.md)：外观特征变了 |

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

> **注意**：导航控制器被模态呈现时，在它上面监听 [`beforedismiss`](ui-view-controller/beforedismiss-event.md)、[`dismiss`](ui-view-controller/dismiss-event.md)、[`dismissattempt`](ui-view-controller/dismissattempt-event.md) 不报错，但收不到。

## 用户自己也能返回

栈不只由代码改变。用户有两种不经过代码的返回方式：

- **点返回按钮。** 导航条左侧的那个按钮。
- **左滑返回。** 手指从页面的左边缘往右滑，栈顶页面跟着手指滑走，露出上一页。见[左滑返回](#左滑返回)。

这两种操作都由系统直接完成弹出，代码没有调用任何方法。弹出完成后，导航控制器派发 `show` 事件，事件对象的 `viewController` 是此刻显示的页面，`nav.viewControllers` 已经是弹出之后的栈。

所以任何时候都以 `nav.viewControllers` 为准。代码里如果另外记了一份「现在在第几层」「当前路径是什么」，要在 `show` 的回调里按 `nav.viewControllers` 重新对齐。

## 栈里的页面由谁保管

**推入之后不需要自己保存页面。** 导航控制器保管栈里的每一个页面，窗口保管导航控制器。页面在栈里期间不会被回收，挂在页面上的数据、加在页面上的事件监听器都一直有效。验收用例验证过：推入之后丢掉对页面的引用，再从 `nav.topViewController` 读回来，得到的是同一个对象，上面的数据还在。

**弹出之后，导航控制器不再保管这个页面。** 这时：

- 代码里没有别的地方保存它，它连同它的视图、视图上的按钮和监听器一起被回收。用户点返回按钮或左滑返回弹出的页面也一样（实测：点返回后，被弹出的页面在几秒内被回收）。
- 代码里保存了它（比如 `popViewController()` 的返回值），它就一直留在内存里，可以再次推入。

页面被回收不需要代码做任何事，也没有事件通知。同一个页面对象不能在栈里出现两次。

## 左滑返回

左滑返回是系统提供的手势：手指从页面的左边缘按下，往右滑，栈顶的页面跟着手指移动；滑过一定距离后松手，页面被弹出。不需要写任何代码。

它和点返回按钮的结果相同：页面被弹出，导航控制器派发 `beforeshow` 和 `show`。实测：栈里有 2 页时，从导航控制器视图的左边缘往右滑 144 pt，`show` 的 `viewController` 是上一页，栈变成 1 页。

手势起作用需要满足四个条件。这四条是 iOS 的规则，除第一条和第四条外**未在模拟器验证**：

| 条件 | 说明 |
| --- | --- |
| 栈里不止一页 | 栈底的页面没有上一页可以返回 |
| 栈顶的页面用的是系统的返回按钮 | 页面设了 [`leftBarButtonItems`](ui-navigation-item/leftbarbuttonitems.md)，或者把 [`hidesBackButton`](ui-navigation-item/hidesbackbutton.md) 设成 `true`，手势就不起作用 |
| 手势没有被禁用 | [`interactivePopGestureRecognizer`](ui-navigation-controller/interactivepopgesturerecognizer.md) 的 `isEnabled` 是 `true`，这是默认值 |
| 从导航控制器自己的视图的左边缘开始滑 | 导航控制器没有占满屏幕时，起点是它的视图的左边缘，不是屏幕的左边缘 |

手指滑到一半又滑回去松手时，页面不会被弹出。这时是否派发事件，**未在模拟器验证**。导航条藏起来之后左滑返回是否还能用，**未在模拟器验证**。

要暂时不让用户返回（比如提交订单的过程中），把这个手势的 `isEnabled` 设成 `false`，完成后再设回 `true`。iOS 26 起还有一个在内容区任意位置右划返回的手势 [`interactiveContentPopGestureRecognizer`](ui-navigation-controller/interactivecontentpopgesturerecognizer.md)，要完全关掉左滑返回，两个都要关。导航条上的返回按钮不受影响。

## 示例

### 首页和详情页

从空白 App 开始：建一个导航控制器，首页上放一个按钮，点按钮进入详情页，并在每次页面切换完成时在控制台输出一行。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const home = new UIViewController();
  home.title = '首页';
  home.view.backgroundColor = 'systemBackground';

  const nav = new UINavigationController(home);
  win.rootViewController = nav;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('看详情', { forState: ['normal'] });
  button.translatesAutoresizingMaskIntoConstraints = false;
  home.view.addSubview(button);
  NSLayoutConstraint.activateConstraints([
    button.centerXAnchor.constraintEqualToAnchor(home.view.centerXAnchor),
    button.centerYAnchor.constraintEqualToAnchor(home.view.centerYAnchor),
  ]);

  button.addEventListener('click', () => {
    const detail = new UIViewController();
    detail.title = '详情';
    detail.view.backgroundColor = 'systemTeal';
    nav.pushViewController(detail, { animated: true });
  });

  nav.addEventListener('show', (event) => {
    console.log('现在显示', event.viewController.title, '，栈里有', nav.viewControllers.length, '页');
  });
});
```

**效果**

- 屏幕顶部有一条导航条，正中是「首页」。页面正中是蓝色的「看详情」。
- 点「看详情」，带着动画切换到青色的详情页。导航条的标题变成「详情」，左侧出现返回按钮，上面的字是「首页」。控制台输出 `现在显示 详情 ，栈里有 2 页`。
- 点返回按钮，或者从页面左边缘往右滑，回到首页。控制台输出 `现在显示 首页 ，栈里有 1 页`。

推入、点返回、左滑返回时 `show` 的派发和栈的页数是实测的。App 启动后首页第一次显示时是否也输出一行，**未在模拟器验证**。这段代码没有作为一个整体在模拟器运行过，其中用到的每个 API 都在验收用例里运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UINavigationController alloc] initWithRootViewController:home]` | `new UINavigationController(home)` |
| `[nav pushViewController:vc animated:YES]` | `nav.pushViewController(vc, { animated: true })` |
| `[nav popViewControllerAnimated:YES]` | `nav.popViewController({ animated: true })` |
| `[nav popToViewController:vc animated:YES]` | `nav.popToViewController(vc, { animated: true })` |
| `[nav popToRootViewControllerAnimated:YES]` | `nav.popToRootViewController({ animated: true })` |
| `[nav setViewControllers:@[a, b] animated:YES]` | `nav.setViewControllers([a, b], { animated: true })` |
| `nav.viewControllers = @[a, b]` | `nav.viewControllers = [a, b]` |
| `nav.navigationBarHidden = YES` | `nav.isNavigationBarHidden = true` |
| `[nav setNavigationBarHidden:YES animated:YES]` | `nav.setNavigationBarHidden(true, { animated: true })` |
| `vc.navigationController` | `vc.navigationController` |
| `- navigationController:willShowViewController:animated:` | `nav.addEventListener('beforeshow', …)` |
| `- navigationController:didShowViewController:animated:` | `nav.addEventListener('show', …)` |
| `nav.toolbarHidden = NO` | `nav.isToolbarHidden = false` |
| `[nav setToolbarHidden:NO animated:YES]` | `nav.setToolbarHidden(false, { animated: true })` |
| `nav.interactivePopGestureRecognizer.enabled = NO` | `nav.interactivePopGestureRecognizer.isEnabled = false` |
| `nav.hidesBarsOnSwipe = YES` | `nav.hidesBarsOnSwipe = true` |
| `[nav showViewController:vc sender:button]` | `nav.showViewController(vc, { sender: button })` |
| `nav.delegate` | 不开放。事件用 `addEventListener()` 监听 |
| `nav.navigationBar` | 导航条上的标题和按钮用页面的 [`navigationItem`](ui-view-controller/navigationitem.md) 设 |

## 参见

- [在页面之间跳转](../guides/navigation.md)：推入、返回、按路径跳转、离开栈时清理、藏导航条
- [在导航条上放按钮和标题](../guides/bar-buttons.md)：导航条上的标题、返回按钮上的字、左右按钮
- [`UIViewController`](ui-view-controller.md)：页面。模态呈现是另一种显示页面的方式
- [`UITabBarController`](ui-tab-bar-controller.md)：底部标签栏。每个标签里常放一个导航控制器
- [`UIWindow`](ui-window.md)：`rootViewController` 在这里设
- [运行时怎么工作](how-it-works.md)：事件什么时候执行、对象什么时候被回收
