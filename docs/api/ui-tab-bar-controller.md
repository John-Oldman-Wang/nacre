---
type: reference
native: UITabBarController
status: partial
---

# `UITabBarController`

`UITabBarController` 是屏幕底部带一排标签的界面。每个标签对应一个页面，点哪个标签就显示哪个页面。很多 App 的主界面是这个结构：首页、行情、我的。

Web 里没有直接对应的东西，通常是自己写一个固定在底部的导航栏加上路由。这里有三点不同：

- **切换是系统做的。** 不用自己监听点击、自己换页面。
- **各个页面一直都在。** 切走的页面不会被销毁，切回来时还是离开时的样子。
- **每个标签长什么样由页面自己决定。** 标题、图标、角标写在页面的 `tabBarItem` 上，不是写在 `UITabBarController` 上。

这一页还包括两个相关的类：[`UITabBarItem`](#uitabbaritem)（一个标签）和 [`UITabBar`](#uitabbar)（那一排标签本身）。

## 完整例子

下面的代码从空白 App 开始，做出一个有三个标签的界面。

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

  // 4. 让它做窗口的根页面。每个 App 都要有下面这三行
  const win = new UIWindow(e.scene);
  win.rootViewController = tabs;
  win.makeKeyAndVisible();

  // 5. 用户点了某个标签时得到通知
  tabs.addEventListener('didselect', () => {
    console.log('现在是第 ' + tabs.selectedIndex + ' 个');
  });
});
```

**效果**：

- 屏幕底部出现三个标签：首页、行情、我的，各带一个图标。
- 一开始显示「首页」，整屏是靛蓝色。
- 点「行情」，整屏变成青色，控制台输出 `现在是第 1 个`。

这段代码没有作为一个整体在模拟器运行过。标签栏的样子**未在模拟器验证**；`viewControllers`、`selectedIndex`、`tabBarItem` 的读写在验收用例里核对过。

SF Symbols 是系统自带的图标库，用名字取图，见 [`UIImage`](ui-image.md)。

## 常见用法

以下例子都沿用上面的 `tabs`、`home`、`market`、`profile`。

### 给标签加角标

```js
market.tabBarItem.badgeValue = '3';
```

**效果**：「行情」标签的右上角出现一个红色的圆，里面写着 3。**样子未在模拟器验证。**

去掉角标写 `null`：

```js
market.tabBarItem.badgeValue = null;
```

**效果**：角标消失。

### 用代码切到某个标签

```js
tabs.selectedIndex = 2;
console.log(tabs.selectedViewController === profile);
```

**效果**：界面切到「我的」。控制台输出 `true`。

> **注意**：用代码切换**不会**派发 `didselect` 事件。那个事件只在用户自己点标签时派发（实测）。需要在两种情况下都做同一件事时，把那件事写成一个函数，切换之后自己调一次。

### 知道用户切了标签

```js
tabs.addEventListener('didselect', (e) => {
  const event = /** @type {UITabBarControllerEvent} */ (e);
  console.log(event.viewController === tabs.selectedViewController);
});
```

**效果**：用户每点一次标签，控制台输出 `true`。`event.viewController` 是被点中的那个页面。

用户点的是已经选中的那个标签时是否派发，**未在模拟器验证**。

### 每个标签里放一个导航栈

标签页里要能一层层点进去时，把 [`UINavigationController`](ui-navigation-controller.md) 放进 `viewControllers`，而不是把页面直接放进去：

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

### 改选中标签的颜色

```js
tabs.tabBar.tintColor = 'systemPink';
tabs.tabBar.unselectedItemTintColor = 'systemGray';
```

**效果**：选中的标签（图标和文字）是粉色，其余的是灰色。**颜色的实际效果未在模拟器验证**，两个属性的读写核对过。

颜色的写法见[颜色](ui-color.md)。

### 藏起标签栏

```js
tabs.setTabBarHidden(true, { animated: true });
```

**效果**：标签栏带着动画消失。再调一次并传 `false` 就回来。**动画未在模拟器验证。**

不要动画的话直接写属性：

```js
tabs.isTabBarHidden = true;
console.log(tabs.isTabBarHidden);
```

**效果**：标签栏立刻消失。控制台输出 `true`。

### 内容滚动时收起标签栏

```js
tabs.tabBarMinimizeBehavior = 'onScrollDown';
```

**效果**：页面里的内容往下滚时，标签栏收成一小条，给内容让出地方；往上滚时恢复。**未在模拟器验证。**

四个取值见[成员说明](#属性)。

### 换掉一组页面

```js
const settings = new UIViewController();
settings.tabBarItem = new UITabBarItem({ title: '设置', image: UIImage.systemImageNamed('gearshape') });

tabs.setViewControllers([home, settings], { animated: true });
console.log(tabs.viewControllers.length);
console.log(market.tabBarController);
```

**效果**：标签栏变成两个标签：首页、设置。控制台输出 `2` 和 `null`。被换掉的 `market` 不再属于 `tabs`。

## 标签的样子由页面决定

`UITabBarController` 自己没有「第 2 个标签叫什么」这样的属性。它读的是 `viewControllers` 里每个页面的 `tabBarItem`：

| 想改的东西 | 写在哪 |
| --- | --- |
| 某个标签的标题、图标、角标 | 那个页面的 `tabBarItem` |
| 有哪几个标签、什么顺序 | `tabs.viewControllers` |
| 现在选中哪个 | `tabs.selectedIndex` |
| 整排标签的颜色 | `tabs.tabBar` |

页面没设 `tabBarItem` 时，系统自动给它建一个，标题用页面的 `title`，没有图标。

## 成员说明

### 继承关系

```
EventTarget
  └─ NSObject
       └─ UIResponder
            └─ UIViewController
                 └─ UITabBarController
```

它是一个页面，所以 [`UIViewController`](ui-view-controller.md) 的成员它都有：可以当窗口的根页面，也可以被模态呈现。

### 创建

```js
const tabs = new UITabBarController();
```

没有参数。建好之后不用自己保存引用：把它交给窗口之后，它和它的各个页面都不会被回收。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `viewControllers` | `UIViewController` 的数组 | 是 | 是 | 空数组 | 各个页面，顺序是标签从左到右的顺序。写 `null` 等于写空数组 |
| `selectedIndex` | 整数 | 是 | 是 | `0`（没有页面时是 `-1`） | 选中的是第几个，从 0 数 |
| `selectedViewController` | `UIViewController` 或 `null` | 是 | 是 | 第一个页面 | 选中的那个页面。没有页面时是 `null` |
| `tabBar` | [`UITabBar`](#uitabbar) | 是 | 否 | — | 那一排标签。每次读是同一个对象 |
| `isTabBarHidden` | 布尔 | 是 | 是 | `false` | `true`：标签栏藏起来。`false`：显示 |
| `tabBarMinimizeBehavior` | 字符串 | 是 | 是 | `'automatic'` | 内容滚动时标签栏要不要收成一小条，取值见下表 |

- `viewControllers` 读出来的是当时的一份快照。往这个数组里 `push` 不会改变界面，要整个赋值，或者用 `setViewControllers()`。读到的每个元素和当初放进去的是同一个对象。
- `selectedIndex` 和 `selectedViewController` 是同一件事的两种写法，改一个另一个跟着变。
- 选中项被用户改变时派发 [`didselect`](#事件)。被你自己的代码改变时不派发。
- **出错**：
  - `selectedIndex` 超出范围：`TypeError: selectedIndex 3 is out of range; there are 3 view controllers`
  - `selectedViewController` 写入不在 `viewControllers` 里的页面：`TypeError: selectedViewController must be one of this tab bar controller's viewControllers`
  - `viewControllers` 里有不是页面的东西：`TypeError: viewControllers only accepts UIViewController`。这时原来的页面不变
  - `tabBarMinimizeBehavior` 写入表里没有的值：`TypeError: tabBarMinimizeBehavior has no value "always"; expected one of: automatic / never / onScrollDown / onScrollUp`

`tabBarMinimizeBehavior` 的取值。四种效果都**未在模拟器验证**，描述来自 Apple 的文档：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统决定 |
| `'never'` | 标签栏一直完整显示 |
| `'onScrollDown'` | 内容往下滚时收起，往上滚时恢复 |
| `'onScrollUp'` | 内容往上滚时收起，往下滚时恢复 |

### 方法

| 方法 | 作用 |
| --- | --- |
| `setViewControllers(list, { animated })` | 换掉全部页面。`animated` 是布尔，默认 `false` |
| `setTabBarHidden(hidden, { animated })` | 藏起或显示标签栏。`hidden` 是布尔；`animated` 是布尔，默认 `false` |

两个方法都没有返回值。

### 事件

| 事件 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `didselect` | 用户点了某个标签 | 多一个字段 `viewController`：被点中的页面 |

```js
tabs.addEventListener('didselect', (e) => {
  const event = /** @type {UITabBarControllerEvent} */ (e);
  console.log(event.type, event.target === tabs, event.viewController === tabs.selectedViewController);
});
```

**效果**：用户点一次标签，输出 `didselect true true`。

- 代码改 `selectedIndex` 或 `selectedViewController` 时不派发（实测）。
- 事件不能取消。不能用它阻止用户切换，见[还不能做的](#还不能做的)。
- 回调不是在点击的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md#事件)。
- 它是一个页面，所以被模态呈现时，[模态的三个关闭事件](ui-view-controller.md#事件)也能在它上面监听。[`traitchange`](ui-trait-collection.md#traitchange-事件) 也能。
- **出错**：监听不认识的事件名抛 `TypeError`：

  ```
  addEventListener has no value "select"; expected one of: didselect / willdismiss / diddismiss / dismissattempted / traitchange
  ```

### `UITabBarItem`

一个标签。挂在页面的 `tabBarItem` 上。

```
EventTarget
  └─ NSObject
       └─ UIBarItem
            └─ UITabBarItem
```

```js
new UITabBarItem()
new UITabBarItem({ title, image, selectedImage, tag, badgeValue, badgeColor })
```

参数里的每一项都可以不给，和建好之后再写对应的属性效果一样。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `title` | 字符串或 `null` | 是 | 是 | `null` | 图标下面的文字 |
| `image` | [`UIImage`](ui-image.md) 或 `null` | 是 | 是 | `null` | 图标 |
| `selectedImage` | `UIImage` 或 `null` | 是 | 是 | `null` | 选中时换成的图标。`null`：选中时仍用 `image` |
| `badgeValue` | 字符串或 `null` | 是 | 是 | `null` | 右上角角标里的文字。`null`：没有角标 |
| `badgeColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 角标的底色。`null`：系统默认的红色 |
| `isEnabled` | 布尔 | 是 | 是 | `true` | `false`：这个标签变灰，点不了 |
| `tag` | 整数 | 是 | 是 | `0` | 给自己用的编号，系统不看它 |

- `badgeValue` 写入的不是字符串时按 `String()` 转，比如写 `12` 得到 `'12'`。
- `badgeColor` 写入时可以是颜色字符串或 `UIColor`，读出来是字符串。
- 这些值变了没有事件。它们只会被你自己的代码改变。
- **`selectedImage` 读回来不是写进去的那个对象**（实测）。系统在写入时另存了一份，尺寸相同，多次读得到的是同一个，但和你给的那个用 `===` 比较是 `false`。`image` 没有这个现象。
- `isEnabled` 是 `false` 时的样子**未在模拟器验证**。

### `UITabBar`

那一排标签本身。从 `tabs.tabBar` 取，不能自己创建：

- `new UITabBar()` 抛 `TypeError: Illegal constructor: UITabBar is created by the runtime, not by new`

它是一个 [`UIView`](ui-view.md)。这里只多两个属性：

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `tintColor` | 颜色字符串或 `null` | 是 | 是 | `'systemBlue'` | 选中的标签的颜色 |
| `unselectedItemTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 没选中的标签的颜色。`null`：系统默认的灰色 |

> **注意**：不要往 `tabBar` 上加子视图，也不要改它的 `frame`。它里面有什么由 `viewControllers` 决定。

### 页面上的两个属性

这两个属性在 [`UIViewController`](ui-view-controller.md) 上，所有页面都有。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `tabBarItem` | `UITabBarItem` | 是 | 是 | 系统自动建的一个，标题是页面的 `title` | 这个页面的标签 |
| `tabBarController` | `UITabBarController` 或 `null` | 是 | 否 | `null` | 这个页面所在的 `UITabBarController`。不在任何一个里面时是 `null` |

- `tabBarItem` 写 `null` 不是清空，而是让系统重新自动建一个。所以读它永远不会得到 `null`。
- **出错**：`tabBarItem` 写入的不是 `UITabBarItem`：`TypeError: tabBarItem needs a UITabBarItem or null`

## 与 iOS 原生写法的对照

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
| `- tabBarController:didSelectViewController:` | `tabs.addEventListener('didselect', …)` |
| `[[UITabBarItem alloc] initWithTitle:@"首页" image:img selectedImage:sel]` | `new UITabBarItem({ title: '首页', image: img, selectedImage: sel })` |
| `vc.tabBarItem.badgeValue = @"3"` | `vc.tabBarItem.badgeValue = '3'` |
| `vc.tabBarController` | `vc.tabBarController` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 在用户点标签时决定「让不让切过去」 | `tabBarController:shouldSelectViewController:` | 未实现。它要求当场返回结果，运行时现在做不到 |
| 用 iOS 18 的新写法描述标签 | `UITab`、`tabs`、`UITabGroup` | 未实现。`UITab` 要一个当场返回页面的回调，原因同上 |
| 超过 5 个标签时的「更多」页，以及让用户调整标签顺序 | `moreNavigationController`、`customizableViewControllers` | 未实现。超过 5 个时系统仍会显示「更多」，但 JS 这边读不到它，`selectedIndex` 在选中「更多」时是 `-1` |
| 定制标签栏的背景、字体、间距 | `UITabBarAppearance` | 未实现 |
| 在标签栏上方放一条附加内容 | `bottomAccessory`（`UITabAccessory`） | 未实现 |
| 用系统预置的标签（搜索、收藏等） | `initWithTabBarSystemItem:tag:` | 未实现 |
| 自己写切换标签的动画 | `UIViewControllerAnimatedTransitioning` | 未实现 |
| 给普通视图设 `tintColor` | `UIView.tintColor` | 未实现。现在只有 `UITabBar` 上有 |

## 参见

- [`UIViewController`](ui-view-controller.md)：页面。`tabBarItem` 和 `tabBarController` 在它上面；想自己画一排标签时用它的父子控制器
- [`UINavigationController`](ui-navigation-controller.md)：每个标签里常放一个导航栈
- [`UIImage`](ui-image.md)：标签的图标，`systemImageNamed()`
- [颜色](ui-color.md)：`tintColor`、`badgeColor` 的写法
- [`UIWindow`](ui-window.md)：`rootViewController` 在这里设
- [运行时怎么工作](how-it-works.md)：事件什么时候执行、对象什么时候被回收
- [实现原理：导航和模态呈现](../internals/navigation.md)
