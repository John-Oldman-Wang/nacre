---
type: reference
native: UITabBar
status: partial
---

# `UITabBar`

**`UITabBar`** represents the row of tabs at the bottom of the screen in a [tab bar controller](ui-tab-bar-controller.md). Which tabs it contains is decided by the tab bar controller's [`viewControllers`](ui-tab-bar-controller/viewcontrollers.md) and each view controller's [`tabBarItem`](ui-view-controller/tabbaritem.md). This class is only for changing the colors of the tabs.

It is a [view](ui-view.md), but don't add subviews to it or change its `frame`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UITabBar`

## Constructor

It can't be created with `new`. `new UITabBar()` throws `TypeError: Illegal constructor: UITabBar is created by the runtime, not by new`. Read it from the tab bar controller's [`tabBar`](ui-tab-bar-controller/tabbar.md).

## Instance properties

Also inherits the properties of [`UIView`](ui-view.md).

| Property | Description |
| --- | --- |
| [`tintColor`](ui-tab-bar/tintcolor.md) | Color of the selected tab |
| [`unselectedItemTintColor`](ui-tab-bar/unselecteditemtintcolor.md) | Color of the unselected tabs |

## Examples

```js
const tabs = new UITabBarController();
tabs.tabBar.tintColor = 'systemPink';
tabs.tabBar.unselectedItemTintColor = 'systemGray';
```

**Effect**: The selected tab (icon and text) is pink, and the others are gray. **How the colors actually look is not verified in the simulator**; reading and writing both properties has been checked.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `tabs.tabBar.tintColor = UIColor.systemPinkColor` | `tabs.tabBar.tintColor = 'systemPink'` |
| `tabs.tabBar.unselectedItemTintColor = UIColor.systemGrayColor` | `tabs.tabBar.unselectedItemTintColor = 'systemGray'` |

## See also

- [`UITabBarController`](ui-tab-bar-controller.md)
- [Colors](ui-color.md)
