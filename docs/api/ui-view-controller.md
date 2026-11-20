---
type: reference
native: UIViewController
status: partial
---

# `UIViewController`

**`UIViewController`** 表示一屏内容的管理者，下文称为页面。页面自己不是视图，不显示在屏幕上。它持有一个根视图 [`view`](ui-view-controller/view.md)，这一屏的界面内容都放在这个视图里。页面负责的是这一屏内容怎样进入屏幕、怎样离开屏幕、和别的页面是什么关系。

系统按页面组织界面，所以即使 App 只有一屏内容，也要有一个页面：

- 窗口不直接接受视图。窗口的内容入口是 [`rootViewController`](ui-window/rootviewcontroller.md)，它的类型是页面。
- 页面之间的切换以页面为单位：[导航栈](ui-navigation-controller.md)里推入和返回的是页面，[标签栏](ui-tab-bar-controller.md)里切换的是页面，[模态呈现](#模态呈现)盖上来的也是页面。切换的动画、返回按钮、返回手势、向下拖动关闭都由系统提供，不用自己写。
- 安全区按页面计算。「安全区」是屏幕上不被刘海、状态栏、底部横条遮挡的区域。父页面可以给子页面多让出一段安全区（[`additionalSafeAreaInsets`](ui-view-controller/additionalsafeareainsets.md)）。

页面由 App 的代码用 `new UIViewController()` 创建，创建不需要场景或窗口。新建的页面不会自己显示，要用下面的一种方式放到屏幕上：

| 方式 | 写法 | 用在什么时候 |
| --- | --- | --- |
| 窗口的根页面 | `win.rootViewController = page` | 每个窗口有一个，是界面的起点。见 [`UIWindow`](ui-window.md) |
| 推入导航栈 | `nav.pushViewController(page, …)` | 同一件事的下一层，比如「列表 → 详情」。见 [`UINavigationController`](ui-navigation-controller.md) |
| 标签栏的一页 | `tabs.viewControllers = […]` | 几个并列的主界面。见 [`UITabBarController`](ui-tab-bar-controller.md) |
| 模态呈现 | `page.presentViewController(other, …)` | 临时打断当前的事，比如「登录」「新建」。见[模态呈现](#模态呈现) |
| 嵌进另一个页面 | `parent.addChildViewController(child)` 等三句 | 自己写容器。见[父子控制器](#父子控制器) |

页面不是视图，不能把页面 `addSubview()` 到别的视图里。页面不能继承：`class MyPage extends UIViewController {}` 在 `new MyPage()` 时抛错。做一个自己的页面的写法是写一个函数，在里面 `new UIViewController()`，往它的 `view` 里放内容，再返回它。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → `UIViewController`

怎么往页面上放内容、在页面出现时刷新，见指南[做一个页面](../guides/pages.md)；怎么弹出和关闭模态页，见指南[弹出一个模态页](../guides/modal-pages.md)。

## 构造函数

[`UIViewController()`](ui-view-controller/constructor.md)

创建一个空页面。它不会自己显示。

## 实例属性

内容和标题：

| 属性 | 说明 |
| --- | --- |
| [`view`](ui-view-controller/view.md) <small>只读</small> | 页面的根视图。页面的内容都放在它里面 |
| [`title`](ui-view-controller/title.md) | 页面标题。在导航条正中和下一页的返回按钮上显示 |
| [`navigationItem`](ui-view-controller/navigationitem.md) <small>只读</small> | 这个页面在导航条上的配置 |
| [`tabBarItem`](ui-view-controller/tabbaritem.md) | 这个页面在底部标签栏上的那一格 |

模态呈现：

| 属性 | 说明 |
| --- | --- |
| [`presentedViewController`](ui-view-controller/presentedviewcontroller.md) <small>只读</small> | 这个页面弹出的模态页 |
| [`presentingViewController`](ui-view-controller/presentingviewcontroller.md) <small>只读</small> | 弹出这个页面的页面 |
| [`modalPresentationStyle`](ui-view-controller/modalpresentationstyle.md) | 被模态呈现时的样式：卡片、全屏… |
| [`modalTransitionStyle`](ui-view-controller/modaltransitionstyle.md) | 被模态呈现时的进出动画 |
| [`isModalInPresentation`](ui-view-controller/ismodalinpresentation.md) | 用户能不能向下拖走这个模态页 |

和别的页面的关系：

| 属性 | 说明 |
| --- | --- |
| [`navigationController`](ui-view-controller/navigationcontroller.md) <small>只读</small> | 这个页面所在的导航控制器 |
| [`tabBarController`](ui-view-controller/tabbarcontroller.md) <small>只读</small> | 这个页面所在的标签栏控制器 |
| [`parentViewController`](ui-view-controller/parentviewcontroller.md) <small>只读</small> | 包含这个页面的父控制器 |
| [`childViewControllers`](ui-view-controller/childviewcontrollers.md) <small>只读</small> | 这个页面的子控制器 |
| [`additionalSafeAreaInsets`](ui-view-controller/additionalsafeareainsets.md) | 在系统的安全区之外再让出的边距 |

外观：

| 属性 | 说明 |
| --- | --- |
| [`traitCollection`](ui-view-controller/traitcollection.md) <small>只读</small> | 页面所处环境的外观特征：深色还是浅色、文字多大 |
| [`overrideUserInterfaceStyle`](ui-view-controller/overrideuserinterfacestyle.md) | 强制这个页面用浅色或深色 |

方向和状态栏（只有 `new` 出来的页面能写，系统的页面写了抛 `TypeError`）：

| 属性 | 说明 |
| --- | --- |
| [`supportedInterfaceOrientations`](ui-view-controller/supportedinterfaceorientations.md) | 这个页面允许界面转到哪些方向 |
| [`preferredInterfaceOrientationForPresentation`](ui-view-controller/preferredinterfaceorientationforpresentation.md) | 全屏弹出时一出来是什么方向 |
| [`prefersInterfaceOrientationLocked`](ui-view-controller/prefersinterfaceorientationlocked.md) | 希望锁住方向 |
| [`prefersStatusBarHidden`](ui-view-controller/prefersstatusbarhidden.md) | 状态栏藏不藏 |
| [`preferredStatusBarStyle`](ui-view-controller/preferredstatusbarstyle.md) | 状态栏的字是黑是白 |

## 实例方法

模态呈现：

| 方法 | 说明 |
| --- | --- |
| [`presentViewController()`](ui-view-controller/presentviewcontroller.md) | 把另一个页面模态呈现出来，盖在当前页面上面 |
| [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md) | 关闭模态页 |

父子控制器：

| 方法 | 说明 |
| --- | --- |
| [`addChildViewController()`](ui-view-controller/addchildviewcontroller.md) | 把一个页面收成子控制器 |
| [`removeFromParentViewController()`](ui-view-controller/removefromparentviewcontroller.md) | 离开父控制器 |
| [`willMoveToParentViewController()`](ui-view-controller/willmovetoparentviewcontroller.md) | 通知「即将换父控制器」 |
| [`didMoveToParentViewController()`](ui-view-controller/didmovetoparentviewcontroller.md) | 通知「已经换好父控制器」 |

方向和状态栏（写对应的属性时已经自动调了）：

| 方法 | 说明 |
| --- | --- |
| [`setNeedsUpdateOfSupportedInterfaceOrientations()`](ui-view-controller/setneedsupdateofsupportedinterfaceorientations.md) | 通知系统重新来问允许的方向 |
| [`setNeedsStatusBarAppearanceUpdate()`](ui-view-controller/setneedsstatusbarappearanceupdate.md) | 通知系统重新来问状态栏 |
| [`setNeedsUpdateOfPrefersInterfaceOrientationLocked()`](ui-view-controller/setneedsupdateofprefersinterfaceorientationlocked.md) | 通知系统重新来问是否锁方向 |

## 事件

出现和消失，每一种页面都有，包括导航控制器和标签栏控制器：

| 事件 | 什么时候派发 |
| --- | --- |
| [`beforeappear`](ui-view-controller/beforeappear-event.md) | 页面的视图即将出现在屏幕上 |
| [`appear`](ui-view-controller/appear-event.md) | 页面的视图已经出现，转场动画结束了 |
| [`beforedisappear`](ui-view-controller/beforedisappear-event.md) | 页面的视图即将离开屏幕 |
| [`disappear`](ui-view-controller/disappear-event.md) | 页面的视图已经离开屏幕 |

模态关闭，在**被弹出的页面**上派发：

| 事件 | 什么时候派发 |
| --- | --- |
| [`beforedismiss`](ui-view-controller/beforedismiss-event.md) | 用户向下拖动卡片，卡片即将关闭 |
| [`dismiss`](ui-view-controller/dismiss-event.md) | 用户拖走卡片，关闭完成 |
| [`dismissattempt`](ui-view-controller/dismissattempt-event.md) | 用户想拖走卡片，但 `isModalInPresentation` 是 `true`，没有关闭 |

外观：

| 事件 | 什么时候派发 |
| --- | --- |
| [`traitchange`](ui-view-controller/traitchange-event.md) | 页面的外观特征变了，比如切到深色模式 |

- 系统派发的是上面这八个事件名。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。事件名拼错时没有任何提示，监听器只是永远不被调用。
- 事件都不能取消，`preventDefault()` 不起作用。
- 回调不是在事情发生的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md)。

## 页面由谁保管

**显示着的页面不需要保存在变量里。** 页面一旦通过上面的任何一种方式放到屏幕上，就由放它的那一方保管：窗口保管根页面，导航栈保管栈里的每个页面，呈现者保管它弹出的模态页，父控制器保管子控制器。保管期间页面不会被回收，它的视图、挂在它上面的事件监听和自定义属性都保留。

页面离开之后是否还存在，取决于 App 的代码有没有保存它：

| 页面怎样离开 | 没有变量保存它时 |
| --- | --- |
| 模态页被代码关闭（`dismissViewController()`） | 关闭动画结束后被回收（实测） |
| 模态页被用户向下拖走 | 被回收（实测） |
| 从导航栈返回（代码弹出，或用户点返回按钮） | 被回收（实测） |
| 子控制器调了 `removeFromParentViewController()` | 被回收（实测） |
| 根页面被另一个页面换掉 | 被回收。**未在模拟器验证** |

回收的时候，页面的视图和视图上的事件监听一起被回收，不需要先逐个移除监听。

## 页面和视图

页面和视图是两种对象，分工不同：

| | 页面（`UIViewController`） | 视图（[`UIView`](ui-view.md)） |
| --- | --- | --- |
| 是什么 | 一屏内容的管理者 | 屏幕上的一块矩形 |
| 能不能画到屏幕上 | 不能，它没有位置和大小 | 能 |
| 怎么组织 | 窗口的根页面、导航栈、模态呈现 | 视图树（`addSubview`） |

每个页面有且只有一个根视图 `view`。界面内容加在 `page.view` 上，页面之间的关系设在页面上。两边不能混：视图不能当页面用，页面也不能当视图加进视图树。`view` 的创建时机、大小和安全区见 [`view`](ui-view-controller/view.md)。

## 页面的出现和消失

四个出现和消失的事件表示的是「视图在不在屏幕上」，不是「页面还在不在」。「出现」不只发生在页面第一次显示时，下面这些情况都会派发（实测）：

| 发生了什么 | 派发 |
| --- | --- |
| 页面被模态弹出 | 这个页面：`beforeappear` → `appear` |
| 模态页被关闭 | 这个页面：`beforedisappear` → `disappear` |
| 导航栈推入下一页 | 原来的页面消失两个，新的页面出现两个 |
| 导航栈返回上一页 | 被弹出的页面消失两个，上一页再出现两个 |
| 标签栏切到另一页 | 原来的页面消失两个，切到的页面出现两个 |
| 被一个全屏的模态页盖住 | 下面的页面消失两个；全屏页关闭后再出现两个 |
| 被一个卡片样式的模态页盖住 | 下面的页面不派发。它的视图还在屏幕上 |
| 子页面的视图加进屏幕上的父页面 | 子页面出现两个；父页面消失时子页面跟着消失 |

页面被下一页盖住时派发 `disappear`，但它还在导航栈里，返回时会再出现。

- 同一个页面上「将」排在「已」前面。两个页面之间的先后是实测的：推入一页时是旧页将消失 → 新页将出现 → 旧页已消失 → 新页已出现；切换标签时是新页将出现 → 旧页将消失 → 旧页已消失 → 新页已出现。不要依赖两个页面之间的先后。
- 没有在屏幕上显示过的页面不派发。
- 用户左滑返回到一半又放手时怎么派发，**未在模拟器验证**。
- 系统弹窗（[`UIAlertController`](ui-alert-controller.md)）和分享面板上不能监听这四个事件。

`viewDidLoad` 没有对应的事件。页面和它的视图都是 App 自己建的，建完接着写就行。

## 父子控制器

一个页面可以包含别的页面，包含别人的叫父控制器，被包含的叫子控制器。导航栈和底部标签栏就是系统写好的两种父控制器。系统没有提供的容器（比如自己画的标签条、左右分栏）才需要自己写。

父子关系和视图树是两件事，各管各的：

| | 父子控制器 | 视图树 |
| --- | --- | --- |
| 建立 | `parent.addChildViewController(child)` | `parent.view.addSubview(child.view)` |
| 作用 | 子页面知道自己属于谁，安全区、`navigationController` 这些从父页面传下来 | 子页面的内容显示在屏幕上 |
| 解除 | `child.removeFromParentViewController()` | `child.view.removeFromSuperview()` |

两边都要做，系统不会自动同步。父控制器保管它的子控制器：加进去之后不需要保存 `child` 变量；移除之后没有变量保存它时，它被回收（实测）。父子关系不能成环。

加入和移除时各有两个通知要发给子页面。系统发一半，另一半要由代码调：

| 时机 | 通知 | 谁来调 |
| --- | --- | --- |
| 加入之前 | `child.willMoveToParentViewController(parent)` | `addChildViewController` 自动调 |
| 加入之后 | `child.didMoveToParentViewController(parent)` | **自己调** |
| 移除之前 | `child.willMoveToParentViewController(null)` | **自己调** |
| 移除之后 | `child.didMoveToParentViewController(null)` | `removeFromParentViewController` 自动调 |

这两个通知是发给系统的，JS 里收不到它们：子页面上没有对应的事件。漏掉「自己调」的那两句时的后果，**未在模拟器验证**。

## 模态呈现

模态呈现（present）把一个新页面盖在当前页面上面。关掉它叫 dismiss。显示一个新页面有两种方式，含义不同：

| | 推入导航栈（push） | 模态呈现（present） |
| --- | --- | --- |
| 从哪里进入 | 从右边滑入 | 从底部滑入 |
| 含义 | 同一件事的下一层，比如「列表 → 详情」 | 打断当前的事，比如「登录」「新建」 |
| 用户怎么退出 | 点返回按钮，或从屏幕左边缘向右滑 | 向下拖（卡片式时），或点页面上的关闭按钮 |
| 系统给不给返回按钮 | 给 | 不给，要自己放关闭按钮 |
| 写法 | [`nav.pushViewController()`](ui-navigation-controller/pushviewcontroller.md) | [`page.presentViewController()`](ui-view-controller/presentviewcontroller.md) |

模态呈现时新页面盖在上面，下面的页面不能操作，关掉以后回到原处。下面的页面没有被移除，它的内容和状态都保留。模态页弹出期间由呈现它的页面保管；关闭之后，没有变量保存它时被回收。

### 谁呈现了谁

`a.presentViewController(b)` 之后，`a.presentedViewController` 是 `b`，`b.presentingViewController` 是弹出 `b` 的那个页面。`b.presentingViewController` 不一定是 `a`：`a` 在导航栈里时，它是 `a` 所在的那个 `UINavigationController`。系统把呈现交给了最近的容器。见 [`presentingViewController`](ui-view-controller/presentingviewcontroller.md)。

### 关闭事件

模态页被关闭有两条途径，只有一条派发事件：

| 途径 | 派发事件 |
| --- | --- |
| 用户向下拖走卡片 | 派发 `beforedismiss`，然后 `dismiss` |
| 代码调 `dismissViewController()` | **不派发任何事件**（实测：三个事件一个都没有收到） |

代码关闭的时刻由代码自己掌握：`dismissViewController()` 返回的 Promise 在关闭动画结束后兑现，收尾写在它后面。事件派发在**被弹出的那个页面**上。

## 示例

### 弹出一张卡片

从空白 App 开始，做两个页面。第一个页面上有一个「打开」按钮，点了以后第二个页面从底部弹出。第二个页面上有一个「关闭」按钮。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const sheet = new UIViewController();
  sheet.view.backgroundColor = 'systemBackground';
  sheet.modalPresentationStyle = 'pageSheet';

  const close = UIButton.buttonWithType('system');
  close.setTitle('关闭', { forState: ['normal'] });
  close.translatesAutoresizingMaskIntoConstraints = false;
  sheet.view.addSubview(close);
  NSLayoutConstraint.activateConstraints([
    close.centerXAnchor.constraintEqualToAnchor(sheet.view.centerXAnchor),
    close.centerYAnchor.constraintEqualToAnchor(sheet.view.centerYAnchor),
  ]);
  close.addEventListener('click', () => {
    sheet.dismissViewController({ animated: true });
  });

  const open = UIButton.buttonWithType('system');
  open.setTitle('打开', { forState: ['normal'] });
  open.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(open);
  NSLayoutConstraint.activateConstraints([
    open.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    open.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
  open.addEventListener('click', async () => {
    await page.presentViewController(sheet, { animated: true });
    console.log('第二个页面已经完全显示');
  });
});
```

**效果**

- 启动后屏幕正中是蓝色的「打开」两个字。
- 点「打开」，第二个页面从屏幕底部向上滑入，以卡片的形式盖在第一个页面上面。
- 滑入动画结束后，控制台输出 `第二个页面已经完全显示`。
- 点「关闭」，卡片向下滑出，回到第一个页面。
- 不点「关闭」，按住卡片向下拖，也能把它关掉。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

这个例子在一开始就建好 `sheet`，并在两个按钮的回调里一直引用它，所以它关闭之后不会被回收，再点「打开」弹出的是同一个页面。每次打开都新建一个模态页的写法见指南[弹出一个模态页](../guides/modal-pages.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIViewController alloc] init]` | `new UIViewController()` |
| `vc.view` | `vc.view` |
| `vc.title = @"设置"` | `vc.title = '设置'` |
| `vc.navigationItem` | `vc.navigationItem` |
| `vc.navigationController` | `vc.navigationController` |
| `[host presentViewController:m animated:YES completion:^{…}]` | `await host.presentViewController(m, { animated: true })` |
| `[vc dismissViewControllerAnimated:YES completion:^{…}]` | `await vc.dismissViewController({ animated: true })` |
| `vc.modalPresentationStyle = UIModalPresentationPageSheet` | `vc.modalPresentationStyle = 'pageSheet'` |
| `vc.modalTransitionStyle = UIModalTransitionStyleCrossDissolve` | `vc.modalTransitionStyle = 'crossDissolve'` |
| `vc.modalInPresentation = YES` | `vc.isModalInPresentation = true` |
| `- presentationControllerWillDismiss:` | `vc.addEventListener('beforedismiss', …)` |
| `- presentationControllerDidDismiss:` | `vc.addEventListener('dismiss', …)` |
| `- presentationControllerDidAttemptToDismiss:` | `vc.addEventListener('dismissattempt', …)` |
| `- presentationControllerShouldDismiss:` | 用 `vc.isModalInPresentation` 代替 |
| 覆写 `- viewWillAppear:`、`- viewDidAppear:` | `vc.addEventListener('beforeappear', …)`、`vc.addEventListener('appear', …)` |
| 覆写 `- viewWillDisappear:`、`- viewDidDisappear:` | `vc.addEventListener('beforedisappear', …)`、`vc.addEventListener('disappear', …)` |
| 覆写 `- viewDidLoad` | 没有对应的事件。建完页面接着写 |
| `[parent addChildViewController:child]` | `parent.addChildViewController(child)` |
| `[child didMoveToParentViewController:parent]` | `child.didMoveToParentViewController(parent)` |
| `[child willMoveToParentViewController:nil]` | `child.willMoveToParentViewController(null)` |
| `[child removeFromParentViewController]` | `child.removeFromParentViewController()` |
| `parent.childViewControllers` | `parent.childViewControllers` |
| `vc.additionalSafeAreaInsets = UIEdgeInsetsMake(0, 0, 44, 0)` | `vc.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, 44, 0)` |
| `vc.tabBarItem`、`vc.tabBarController` | `vc.tabBarItem`、`vc.tabBarController` |

有四处和原生不同：

- 原生的 `completion` 回调在 JS 里是 Promise。
- 把页面加成它自己或它后代的子控制器，原生不检查，之后会崩溃。JS 里当场抛 `TypeError`。
- 原生靠覆写 `viewWillAppear:` 一组方法得知页面出现和消失。JS 里原生类不能继承，这四个时机是页面的事件，回调稍后执行。
- 原生的三个关闭通知在 `vc.presentationController.delegate` 上。JS 里它们是被弹出页面自己的事件。

## 参见

- [做一个页面](../guides/pages.md)：放内容、设标题、出现时刷新、嵌入子页面
- [弹出一个模态页](../guides/modal-pages.md)：弹出、关闭、不让拖走、收尾
- [`UINavigationController`](ui-navigation-controller.md)：推入和弹出导航栈
- [`UITabBarController`](ui-tab-bar-controller.md)：系统写好的底部标签栏
- [`UINavigationItem`](ui-navigation-item.md)：`navigationItem` 的类型，导航条的标题和按钮
- [`UIWindow`](ui-window.md)：`rootViewController` 在这里设
- [`UIView`](ui-view.md)：`view` 的类型
- [原生类](native-classes.md)：不能继承，以及替代写法
- [`UIWindowScene`](ui-window-scene.md)：场景被销毁后页面怎样被回收
- [外观特征](ui-trait-collection.md)：`traitCollection`、`overrideUserInterfaceStyle` 和 `traitchange` 事件
