---
type: reference
native: UITabBarController.tabBarHidden
---

# `UITabBarController`: `isTabBarHidden` property

The **`isTabBarHidden`** property determines whether the tab bar is hidden.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The tab bar is hidden |
| `false` | It is shown |

- Readable and writable.
- Defaults to `false`.
- Writing it is not animated; the tab bar disappears or appears immediately. For animation, use [`setTabBarHidden()`](settabbarhidden.md).
- No event fires when it changes: only code changes it.

## Examples

```js
const tabs = new UITabBarController();
tabs.isTabBarHidden = true;
console.log(tabs.isTabBarHidden);
```

**Effect**: the tab bar disappears immediately. The console logs `true`.

## Corresponding iOS API

`UITabBarController.tabBarHidden`. In JS it is called `isTabBarHidden`.

## See also

- [`setTabBarHidden()`](settabbarhidden.md)
