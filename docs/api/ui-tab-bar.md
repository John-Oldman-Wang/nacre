---
type: reference
native: UITabBar
status: partial
---

# `UITabBar`

**`UITabBar`** 表示[标签控制器](ui-tab-bar-controller.md)屏幕底部的那一排标签。它里面有哪几个标签，由标签控制器的 [`viewControllers`](ui-tab-bar-controller/viewcontrollers.md) 和每个页面的 [`tabBarItem`](ui-view-controller/tabbaritem.md) 决定。这个类只用来改标签的颜色。

它是一个[视图](ui-view.md)，但不要往它上面加子视图，也不要改它的 `frame`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UITabBar`

## 构造函数

不能用 `new` 创建。`new UITabBar()` 抛 `TypeError: Illegal constructor: UITabBar is created by the runtime, not by new`。从标签控制器的 [`tabBar`](ui-tab-bar-controller/tabbar.md) 读。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。

| 属性 | 说明 |
| --- | --- |
| [`tintColor`](ui-tab-bar/tintcolor.md) | 选中的标签的颜色 |
| [`unselectedItemTintColor`](ui-tab-bar/unselecteditemtintcolor.md) | 没选中的标签的颜色 |

## 示例

```js
const tabs = new UITabBarController();
tabs.tabBar.tintColor = 'systemPink';
tabs.tabBar.unselectedItemTintColor = 'systemGray';
```

**效果**：选中的标签（图标和文字）是粉色，其余的是灰色。**颜色的实际效果未在模拟器验证**，两个属性的读写核对过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `tabs.tabBar.tintColor = UIColor.systemPinkColor` | `tabs.tabBar.tintColor = 'systemPink'` |
| `tabs.tabBar.unselectedItemTintColor = UIColor.systemGrayColor` | `tabs.tabBar.unselectedItemTintColor = 'systemGray'` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 定制标签栏的背景、字体、间距 | `UITabBarAppearance` |
| 给普通视图设 `tintColor` | `UIView.tintColor`。现在只有 `UITabBar` 上有 |

## 参见

- [`UITabBarController`](ui-tab-bar-controller.md)
- [颜色](ui-color.md)
