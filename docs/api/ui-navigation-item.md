---
type: reference
native: UINavigationItem
status: partial
---

# `UINavigationItem`

**`UINavigationItem`** 表示一个页面在导航条上的配置：正中的标题、副标题、下一页返回按钮上的字、左右两侧各有哪些按钮。导航条是 [`UINavigationController`](ui-navigation-controller.md) 在屏幕顶部画的一条。

导航条只有一条，配置却是每个页面一份。每个 [`UIViewController`](ui-view-controller.md) 自带一个 `UINavigationItem`，从 [`navigationItem`](ui-view-controller/navigationitem.md) 读到。导航控制器显示哪个页面，导航条就显示那个页面的配置。页面切换时导航条的内容跟着换，不需要代码处理。

两侧的按钮是 [`UIBarButtonItem`](ui-bar-button-item.md)。

**继承关系**：`EventTarget` → `NSObject` → `UINavigationItem`

怎么改标题、放按钮、改返回按钮，见指南[在导航条上放按钮和标题](../guides/bar-buttons.md)。

## 构造函数

不能用 `new` 创建。`new UINavigationItem()` 抛 `TypeError: Illegal constructor: UINavigationItem is created by the runtime, not by new`。从页面的 [`navigationItem`](ui-view-controller/navigationitem.md) 读：每个页面只有一个，每次读到的是同一个对象。

## 实例属性

这些属性变了都没有事件：它们只会被代码改变。

| 属性 | 说明 |
| --- | --- |
| [`title`](ui-navigation-item/title.md) | 导航条正中的文字 |
| [`subtitle`](ui-navigation-item/subtitle.md) | 标题下面的一行小字 |
| [`backButtonTitle`](ui-navigation-item/backbuttontitle.md) | **下一页**的返回按钮上的字 |
| [`hidesBackButton`](ui-navigation-item/hidesbackbutton.md) | 这一页在栈顶时不显示返回按钮 |
| [`titleView`](ui-navigation-item/titleview.md) | 显示在导航条正中、代替标题文字的视图 |
| [`leftBarButtonItems`](ui-navigation-item/leftbarbuttonitems.md) | 左侧的按钮 |
| [`rightBarButtonItems`](ui-navigation-item/rightbarbuttonitems.md) | 右侧的按钮 |

## 配置什么时候生效

`navigationItem` 在页面创建时就有，页面不在导航栈里时也可以读写。这时没有导航条显示它，设置的内容被保存下来，页面进入导航栈、成为栈顶时显示。所以配置可以在推入之前全部设好。

页面已经显示在屏幕上时再改，导航条是否立刻更新，**未在模拟器验证**。

## 返回按钮是系统加的

返回按钮不属于当前页面的配置。导航栈里不止一页时，系统自动在导航条左侧放一个返回按钮，点它弹出当前页面。

返回按钮上的字来自**上一页**，不是当前页：

1. 上一页设了 [`backButtonTitle`](ui-navigation-item/backbuttontitle.md)，用它。
2. 没设，用上一页的标题。

## 标题的两个入口

导航条的标题可以从两个属性写：页面的 [`title`](ui-view-controller/title.md) 和 `navigationItem` 的 [`title`](ui-navigation-item/title.md)。它们是两份数据，同步是单向的（实测）：

| 操作 | `page.title` | `page.navigationItem.title` |
| --- | --- | --- |
| 写 `page.title` | 新值 | 跟着变成新值 |
| 写 `page.navigationItem.title` | 不变 | 新值 |
| 把 `page.navigationItem.title` 写成 `null` | 不变 | `null`，不会退回 `page.title` 的值 |

导航条显示的是 `navigationItem.title`。只用其中一个，推荐用 `page.title`，理由见指南的[推荐的做法](../guides/bar-buttons.md#推荐的做法)。

## 左侧按钮和返回

导航条左侧原本是返回按钮的位置。按 iOS 的规则：

| 页面的设置 | 返回按钮 | [左滑返回](ui-navigation-controller.md) |
| --- | --- | --- |
| 什么都不设 | 显示 | 可用 |
| `leftBarButtonItems` 里有按钮 | 不显示，位置让给这些按钮 | 不可用 |
| `hidesBackButton` 是 `true` | 不显示 | 不可用 |

后两行**未在模拟器验证**。左侧换成别的按钮之后，系统不再认为「往回走」是这个页面默认的操作，所以页面要自己提供返回的方式。

## 示例

```js
const page = new UIViewController();
page.title = '设置';
page.navigationItem.subtitle = '共 12 条';
page.navigationItem.rightBarButtonItems = [new UIBarButtonItem({ title: '完成' })];

console.log(page.navigationItem instanceof UINavigationItem);
console.log(page.navigationItem === page.navigationItem);
console.log(page.navigationItem.title);
```

**结果**：控制台依次输出 `true`、`true`、`设置`。页面推入导航栈后，导航条正中是「设置」，下面一行小字「共 12 条」，右侧是「完成」。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `vc.navigationItem.rightBarButtonItems = @[a, b]` | `vc.navigationItem.rightBarButtonItems = [a, b]` |
| `vc.navigationItem.rightBarButtonItem = a` | `vc.navigationItem.rightBarButtonItems = [a]` |
| `vc.navigationItem.titleView = v` | `vc.navigationItem.titleView = v` |
| `vc.navigationItem.backButtonTitle = @"返回"` | `vc.navigationItem.backButtonTitle = '返回'` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 大标题和大副标题 | `largeTitleDisplayMode`、`largeTitle`、`largeSubtitle` |
| 换掉返回按钮本身，或者拦截返回 | `backBarButtonItem`、`backAction` |
| 设了左侧按钮之后仍然保留返回按钮 | `leftItemsSupplementBackButton` |
| 把自己的视图当副标题 | `subtitleView` |
| 屏幕底部的工具条 | `UIToolbar`、`toolbarItems` |

## 参见

- [在导航条上放按钮和标题](../guides/bar-buttons.md)
- [`UIBarButtonItem`](ui-bar-button-item.md)：两侧的按钮
- [`UIViewController`](ui-view-controller.md)：页面。`title` 和 `navigationItem` 在它上面
- [`UINavigationController`](ui-navigation-controller.md)：导航条由它显示；推入、弹出、左滑返回
- [实现原理：导航](../internals/navigation.md)
