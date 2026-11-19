---
type: reference
native: UITabBarController.tabBar
---

# `UITabBarController`: `tabBar` property

The **`tabBar`** property is the row of tabs at the bottom of the screen. Use it to change the tabs' colors.

## Value

A [`UITabBar`](../ui-tab-bar.md).

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object.

> **Note:** Do not add subviews to `tabBar` or change its `frame`. What it contains is determined by [`viewControllers`](viewcontrollers.md).

## Examples

```js
const tabs = new UITabBarController();
tabs.tabBar.tintColor = 'systemPink';
console.log(tabs.tabBar === tabs.tabBar, tabs.tabBar.tintColor);
```

**Result**: the console logs `true systemPink`.

## Corresponding iOS API

`UITabBarController.tabBar`.

## See also

- [`UITabBar`](../ui-tab-bar.md)
