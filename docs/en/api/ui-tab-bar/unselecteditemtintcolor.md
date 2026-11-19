---
type: reference
native: UITabBar.unselectedItemTintColor
---

# `UITabBar`: `unselectedItemTintColor` property

The **`unselectedItemTintColor`** property is the color of the unselected tabs.

## Value

A color string, or `null`.

- Readable and writable. You can write a color string or a `UIColor`; it reads back as a string.
- Defaults to `null`: the system's default gray.
- For how to write colors and what happens with invalid values, see [Colors](../ui-color.md).
- No event fires when it changes: only code changes it.

## Examples

```js
const tabs = new UITabBarController();
tabs.tabBar.unselectedItemTintColor = 'systemGray';
console.log(tabs.tabBar.unselectedItemTintColor);
```

**Result**: The console prints `systemGray`. The unselected tabs turn gray; **how the color actually looks is not verified in the simulator**.

## Corresponding iOS API

`UITabBar.unselectedItemTintColor`.

## See also

- [`tintColor`](tintcolor.md)
