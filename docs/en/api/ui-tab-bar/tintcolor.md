---
type: reference
native: UITabBar.tintColor
---

# `UITabBar`: `tintColor` property

The **`tintColor`** property is the color of the selected tab (icon and text).

## Value

A color string, or `null`.

- Readable and writable. You can write a color string or a `UIColor`; it reads back as a string.
- Defaults to `'systemBlue'`.
- For how to write colors and what happens with invalid values, see [Colors](../ui-color.md).
- No event fires when it changes: only code changes it.

## Examples

```js
const tabs = new UITabBarController();
console.log(tabs.tabBar.tintColor);
tabs.tabBar.tintColor = 'systemPink';
console.log(tabs.tabBar.tintColor);
```

**Result**: It first prints `systemBlue`, then `systemPink`. The selected tab turns pink; **how the color actually looks is not verified in the simulator**.

## Corresponding iOS API

`UITabBar.tintColor` (inherited from `UIView`; here it is provided only on `UITabBar`).

## See also

- [`unselectedItemTintColor`](unselecteditemtintcolor.md)
