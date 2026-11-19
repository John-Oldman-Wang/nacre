---
type: reference
native: UITabBarController
status: partial
---

# `UITabBarController`

**`UITabBarController`** 表示一个带标签栏的界面，称为标签控制器。它自己是一个页面（[`UIViewController`](ui-view-controller.md)），管理一组页面：屏幕底部有一排标签，称为**标签栏**，每个标签对应一个页面，用户点哪个标签，屏幕就显示哪个页面。「首页、行情、我的」这种主界面用的就是它。

标签栏和点击标签后的切换都由系统提供。代码不需要监听点击，也不需要自己更换页面。

每个标签上显示的标题、图标和角标由对应的页面决定，设在页面的 [`tabBarItem`](ui-view-controller/tabbaritem.md) 上，类型是 [`UITabBarItem`](ui-tab-bar-item.md)。标签栏本身是 [`UITabBar`](ui-tab-bar.md)，从 [`tabBar`](ui-tab-bar-controller/tabbar.md) 读到，用来改颜色。

它是一个页面，所以 `UIViewController` 的成员它都有：可以当窗口的根页面，也可以被模态呈现。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UITabBarController`

怎么做出一组标签、加角标、在标签里放导航栈，见指南[做一组底部标签](../guides/tabs.md)。

## 构造函数

[`UITabBarController()`](ui-tab-bar-controller/constructor.md)

创建一个没有页面的标签控制器。

## 实例属性

还继承 [`UIViewController`](ui-view-controller.md) 的属性。

| 属性 | 说明 |
| --- | --- |
| [`viewControllers`](ui-tab-bar-controller/viewcontrollers.md) | 各个页面，顺序是标签从左到右的顺序 |
| [`selectedIndex`](ui-tab-bar-controller/selectedindex.md) | 选中的是第几个，从 0 数 |
| [`selectedViewController`](ui-tab-bar-controller/selectedviewcontroller.md) | 选中的那个页面 |
| [`tabBar`](ui-tab-bar-controller/tabbar.md) <small>只读</small> | 那一排标签 |
| [`isTabBarHidden`](ui-tab-bar-controller/istabbarhidden.md) | 标签栏藏不藏 |
| [`tabBarMinimizeBehavior`](ui-tab-bar-controller/tabbarminimizebehavior.md) | 内容滚动时标签栏要不要收成一小条 |

## 实例方法

还继承 [`UIViewController`](ui-view-controller.md) 的方法。

| 方法 | 说明 |
| --- | --- |
| [`setViewControllers()`](ui-tab-bar-controller/setviewcontrollers.md) | 换掉全部页面，可以带动画 |
| [`setTabBarHidden()`](ui-tab-bar-controller/settabbarhidden.md) | 藏起或显示标签栏，可以带动画 |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`tabselect`](ui-tab-bar-controller/tabselect-event.md) | 用户点了某个标签。代码切换时不派发 |
| [`beforedismiss`](ui-view-controller/beforedismiss-event.md)、[`dismiss`](ui-view-controller/dismiss-event.md)、[`dismissattempt`](ui-view-controller/dismissattempt-event.md) | 继承自 [`UIViewController`](ui-view-controller.md)：被模态呈现时的关闭事件 |
| [`beforeappear`](ui-view-controller/beforeappear-event.md)、[`appear`](ui-view-controller/appear-event.md)、[`beforedisappear`](ui-view-controller/beforedisappear-event.md)、[`disappear`](ui-view-controller/disappear-event.md) | 继承自 [`UIViewController`](ui-view-controller.md)：出现和消失 |
| [`traitchange`](ui-view-controller/traitchange-event.md) | 继承自 [`UIViewController`](ui-view-controller.md)：外观特征变了 |

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 切换标签时页面不会被销毁

标签控制器保管 `viewControllers` 里的每一个页面。页面交给它之后不需要自己保存；只要它们还在 `viewControllers` 里，就不会被回收，不管当前选中的是不是它。验收用例验证过：放进去之后丢掉对页面的引用，再从 `tabs.viewControllers` 读回来，得到的是同一个对象，挂在上面的数据还在。

所以用户从一个标签切到另一个标签时，离开的那个页面还在内存里，它的视图、数据、事件监听器都保持原样。切回来时显示的是同一个页面对象。页面上正在运行的定时器、网络轮询在切走之后也继续运行，标签控制器不会停掉它们。

页面从 `viewControllers` 里被换掉之后，标签控制器不再保管它。这时代码里没有别的地方保存它，它就被回收（验收用例验证过）。

## 选中项变了怎么知道

选中的标签有两种改变方式，通知不一样：

| 谁改的 | 是否派发 `tabselect` |
| --- | --- |
| 用户点了标签 | 派发。事件对象的 `viewController` 是被点中的页面 |
| 代码写 `selectedIndex` 或 `selectedViewController` | 不派发（实测：连写两次，一次都没有收到） |

事件派发时切换已经完成，不能用它阻止切换。

## 标签的样子由页面决定

`UITabBarController` 自己没有「第 2 个标签叫什么」这样的属性。它读的是 `viewControllers` 里每个页面的 `tabBarItem`：

| 想改的东西 | 写在哪 |
| --- | --- |
| 某个标签的标题、图标、角标 | 那个页面的 `tabBarItem` |
| 有哪几个标签、什么顺序 | `tabs.viewControllers` |
| 现在选中哪个 | `tabs.selectedIndex` |
| 整排标签的颜色 | `tabs.tabBar` |

页面没设 `tabBarItem` 时，系统自动给它建一个，标题用页面的 `title`，没有图标。标签栏只看 `viewControllers` 里直接放的那一层：放的是导航控制器时，`tabBarItem` 设在导航控制器上。

## 示例

### 三个标签

从空白 App 开始，做出一个有三个标签的界面。

```js
application.addEventListener('sceneconnect', (e) => {
  /**
   * @param {string} title
   * @param {string} symbol SF Symbols 里的图标名
   * @param {string} color
   */
  function makePage(title, symbol, color) {
    const page = new UIViewController();
    page.view.backgroundColor = color;
    page.tabBarItem = new UITabBarItem({
      title,
      image: UIImage.systemImageNamed(symbol),
    });
    return page;
  }

  const home = makePage('首页', 'house', 'systemIndigo');
  const market = makePage('行情', 'chart.line.uptrend.xyaxis', 'systemTeal');
  const profile = makePage('我的', 'person', 'systemOrange');

  const tabs = new UITabBarController();
  tabs.viewControllers = [home, market, profile];

  const win = new UIWindow(e.scene);
  win.rootViewController = tabs;
  win.makeKeyAndVisible();

  tabs.addEventListener('tabselect', () => {
    console.log('现在是第 ' + tabs.selectedIndex + ' 个');
  });
});
```

**效果**

- 屏幕底部出现三个标签：首页、行情、我的，各带一个图标。
- 一开始显示「首页」，整屏是靛蓝色。
- 点「行情」，整屏变成青色，控制台输出 `现在是第 1 个`。

这段代码没有作为一个整体在模拟器运行过。标签栏的样子**未在模拟器验证**；`viewControllers`、`selectedIndex`、`tabBarItem` 的读写在验收用例里核对过。SF Symbols 是系统自带的图标库，用名字取图，见 [`UIImage`](ui-image.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UITabBarController alloc] init]` | `new UITabBarController()` |
| `tabs.viewControllers = @[a, b, c]` | `tabs.viewControllers = [a, b, c]` |
| `[tabs setViewControllers:@[a, b] animated:YES]` | `tabs.setViewControllers([a, b], { animated: true })` |
| `tabs.selectedIndex = 1` | `tabs.selectedIndex = 1` |
| `tabs.selectedIndex == NSNotFound` | `tabs.selectedIndex === -1` |
| `tabs.selectedViewController` | `tabs.selectedViewController` |
| `tabs.tabBar.tintColor = UIColor.systemPinkColor` | `tabs.tabBar.tintColor = 'systemPink'` |
| `tabs.tabBarHidden = YES` | `tabs.isTabBarHidden = true` |
| `[tabs setTabBarHidden:YES animated:YES]` | `tabs.setTabBarHidden(true, { animated: true })` |
| `tabs.tabBarMinimizeBehavior = UITabBarMinimizeBehaviorOnScrollDown` | `tabs.tabBarMinimizeBehavior = 'onScrollDown'` |
| `- tabBarController:didSelectViewController:` | `tabs.addEventListener('tabselect', …)` |
| `vc.tabBarItem.badgeValue = @"3"` | `vc.tabBarItem.badgeValue = '3'` |
| `vc.tabBarController` | `vc.tabBarController` |

## 参见

- [做一组底部标签](../guides/tabs.md)：角标、代码切换、每个标签里放导航栈、颜色、藏标签栏
- [`UITabBarItem`](ui-tab-bar-item.md)：一个标签
- [`UITabBar`](ui-tab-bar.md)：标签栏本身
- [`UIViewController`](ui-view-controller.md)：页面。`tabBarItem` 和 `tabBarController` 在它上面；想自己画一排标签时用它的父子控制器
- [`UINavigationController`](ui-navigation-controller.md)：每个标签里常放一个导航栈
- [`UIWindow`](ui-window.md)：`rootViewController` 在这里设
