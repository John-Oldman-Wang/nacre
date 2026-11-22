# 做一组底部标签

这一篇讲怎么用标签控制器 [`UITabBarController`](../api/ui-tab-bar-controller.md) 做「首页、行情、我的」这种屏幕底部有一排标签的主界面：设标签的样子、加角标、切换、在每个标签里放导航栈。一个标签的样子是 [`UITabBarItem`](../api/ui-tab-bar-item.md)，标签栏本身是 [`UITabBar`](../api/ui-tab-bar.md)。

## 推荐的做法

- **让标签控制器做窗口的根页面，每个标签里放一个导航控制器。** 标签页里通常要能一层层点进去。把 [`UINavigationController`](../api/ui-navigation-controller.md) 放进 `viewControllers`，页面在各自的导航栈里推入和弹出，底部的标签栏一直在。写法见[每个标签里放一个导航栈](#每个标签里放一个导航栈)。
- **页面交给标签控制器之前，先设好它的 [`tabBarItem`](../api/ui-view-controller/tabbaritem.md)。** 没设的页面，系统按页面的 `title` 自动建一个只有文字、没有图标的标签。
- **选中项变化后要做的事，写成一个函数，两处都调。** 用户点标签时派发 [`tabselect`](../api/ui-tab-bar-controller/tabselect-event.md)；代码切换标签时不派发。所以在 `tabselect` 的回调里调一次，代码写完 `selectedIndex` 之后自己再调一次，两种方式的结果才一致：

```js
/**
 * @param {UITabBarController} tabs
 */
function watchSelection(tabs) {
  function selectionChanged() {
    console.log('现在是第 ' + tabs.selectedIndex + ' 个');
  }

  tabs.addEventListener('tabselect', selectionChanged);

  return {
    /** @param {number} index */
    select(index) {
      tabs.selectedIndex = index;
      selectionChanged();
    },
  };
}
```

**效果**：用户点标签，或者代码调用返回对象的 `select()`，控制台都输出一行当前选中的序号。

- **切走的页面要暂停的工作，用页面自己的出现和消失事件。** 切换标签时，离开的页面派发 [`disappear`](../api/ui-view-controller/disappear-event.md)，切到的页面派发 [`beforeappear`](../api/ui-view-controller/beforeappear-event.md)（实测）。标签控制器不会替页面停掉定时器和网络轮询，见[切走时暂停刷新](#切走时暂停刷新)。

## 第一组标签

从空白 App 开始，做出一个有三个标签的界面。

```js
application.addEventListener('sceneconnect', (e) => {
  /**
   * 建一个页面，并设好它在标签栏上的样子
   * @param {string} title
   * @param {string} symbol SF Symbols 里的图标名
   * @param {string} color
   */
  function makePage(title, symbol, color) {
    const page = new UIViewController();
    page.view.backgroundColor = color;
    // 1. 这个页面的标签：标题和图标
    page.tabBarItem = new UITabBarItem({
      title,
      image: UIImage.systemImageNamed(symbol),
    });
    return page;
  }

  // 2. 三个页面
  const home = makePage('首页', 'house', 'systemIndigo');
  const market = makePage('行情', 'chart.line.uptrend.xyaxis', 'systemTeal');
  const profile = makePage('我的', 'person', 'systemOrange');

  // 3. 交给 UITabBarController，顺序就是标签从左到右的顺序
  const tabs = new UITabBarController();
  tabs.viewControllers = [home, market, profile];

  // 4. 让它做窗口的根页面
  const win = new UIWindow(e.scene);
  win.rootViewController = tabs;
  win.makeKeyAndVisible();

  // 5. 用户点了某个标签时得到通知
  tabs.addEventListener('tabselect', () => {
    console.log('现在是第 ' + tabs.selectedIndex + ' 个');
  });
});
```

**效果**

- 屏幕底部出现三个标签：首页、行情、我的，各带一个图标。
- 一开始显示「首页」，整屏是靛蓝色。
- 点「行情」，整屏变成青色，控制台输出 `现在是第 1 个`。

这段代码没有作为一个整体在模拟器运行过。标签栏的样子**未在模拟器验证**；`viewControllers`、`selectedIndex`、`tabBarItem` 的读写在验收用例里核对过。SF Symbols 是系统自带的图标库，用名字取图，见 [`UIImage`](../api/ui-image.md)。

下面的例子沿用这里的 `tabs`、`home`、`market`、`profile`。单独试某一节时，先写这几行：

```js
const home = new UIViewController();
const market = new UIViewController();
const profile = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, market, profile];
```

## 给标签加角标

```js
market.tabBarItem.badgeValue = '3';
```

**效果**：「行情」标签的右上角出现一个红色的圆，里面写着 3。**样子未在模拟器验证。**

去掉角标写 `null`：

```js
market.tabBarItem.badgeValue = null;
```

**效果**：角标消失。

## 用代码切到某个标签

```js
tabs.selectedIndex = 2;
console.log(tabs.selectedViewController === profile);
```

**效果**：界面切到「我的」。控制台输出 `true`。

> **注意**：用代码切换**不会**派发 `tabselect` 事件。那个事件只在用户自己点标签时派发（实测）。需要在两种情况下都做同一件事时，见[推荐的做法](#推荐的做法)。

## 知道用户切了标签

```js
tabs.addEventListener('tabselect', (event) => {
  console.log(event.viewController === tabs.selectedViewController);
});
```

**效果**：用户每点一次标签，控制台输出 `true`。`event.viewController` 是被点中的那个页面。

## 切走时暂停刷新

```js
/** @type {number | undefined} */
let ticker;
market.addEventListener('beforeappear', () => {
  ticker = setInterval(() => console.log('刷新行情'), 1000);
});
market.addEventListener('disappear', () => {
  clearInterval(ticker);
});
```

**效果**：「行情」标签在屏幕上时每秒输出一行 `刷新行情`；切到别的标签之后停止，切回来重新开始。**这段代码没有作为一个整体在模拟器运行过**；切换标签时派发这两个事件是实测的。

## 每个标签里放一个导航栈

标签页里要能一层层点进去时，把 [`UINavigationController`](../api/ui-navigation-controller.md) 放进 `viewControllers`，而不是把页面直接放进去：

```js
const list = new UIViewController();
list.title = '列表';

const nav = new UINavigationController(list);
nav.tabBarItem = new UITabBarItem({
  title: '行情',
  image: UIImage.systemImageNamed('chart.line.uptrend.xyaxis'),
});

tabs.viewControllers = [home, nav, profile];
```

**效果**：中间那个标签里有一条导航条，标题是「列表」。在它里面推入新页面时，底部的标签栏一直在。**未在模拟器验证。**

> **注意**：这时 `tabBarItem` 要设在 `nav` 上，不是设在 `list` 上。标签栏只看 `viewControllers` 里直接放的那一层。

## 改选中标签的颜色

```js
tabs.tabBar.tintColor = 'systemPink';
tabs.tabBar.unselectedItemTintColor = 'systemGray';
```

**效果**：选中的标签（图标和文字）是粉色，其余的是灰色。**颜色的实际效果未在模拟器验证**，两个属性的读写核对过。

颜色的写法见[颜色](../api/ui-color.md)。

## 藏起标签栏

```js
tabs.setTabBarHidden(true, { animated: true });
```

**效果**：标签栏带着动画消失。再调一次并传 `false` 就回来。**动画未在模拟器验证。**

不要动画的话直接写 [`isTabBarHidden`](../api/ui-tab-bar-controller/istabbarhidden.md)：

```js
tabs.isTabBarHidden = true;
```

**效果**：标签栏立刻消失。

## 内容滚动时收起标签栏

```js
tabs.tabBarMinimizeBehavior = 'onScrollDown';
```

**效果**：页面里的内容往下滚时，标签栏收成一小条，给内容让出地方；往上滚时恢复。**未在模拟器验证。**

四个取值见 [`tabBarMinimizeBehavior`](../api/ui-tab-bar-controller/tabbarminimizebehavior.md)。

## 换掉一组页面

```js
const settings = new UIViewController();
settings.tabBarItem = new UITabBarItem({ title: '设置', image: UIImage.systemImageNamed('gearshape') });

tabs.setViewControllers([home, settings], { animated: true });
console.log(tabs.viewControllers.length);
console.log(market.tabBarController);
```

**效果**：标签栏变成两个标签：首页、设置。控制台输出 `2` 和 `null`。被换掉的 `market` 不再属于 `tabs`。

## 参见

- [`UITabBarController`](../api/ui-tab-bar-controller.md)：标签控制器的全部成员
- [`UITabBarItem`](../api/ui-tab-bar-item.md)、[`UITabBar`](../api/ui-tab-bar.md)
- [在页面之间跳转](navigation.md)：标签里的导航栈
- [做一个页面](pages.md)：页面的出现和消失事件
