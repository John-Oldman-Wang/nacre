---
type: reference
native: UITabBarItem.badgeValue
---

# `UITabBarItem`: `badgeValue` property

The **`badgeValue`** property is the text in the badge in the tab's top-right corner.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`: no badge. Write `null` to remove the badge.
- Values that are not strings are converted with `String()`; for example, writing `12` gives `'12'`.
- No event fires when it changes: only code changes it.

## Examples

```js
const market = new UIViewController();
market.tabBarItem.badgeValue = '3';
console.log(market.tabBarItem.badgeValue);
market.tabBarItem.badgeValue = null;
```

**Effect**: After the view controller is put into a tab bar controller, a red circle with 3 in it appears in the top-right corner of its tab; after writing `null`, the badge disappears. The console prints `3`. **How it looks is not verified in the simulator.**

## Corresponding iOS API

`UITabBarItem.badgeValue`.

## See also

- [`badgeColor`](badgecolor.md)
