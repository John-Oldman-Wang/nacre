---
type: reference
native: UIView.insetsLayoutMarginsFromSafeArea
---

# `UIView`: `insetsLayoutMarginsFromSafeArea` property

The **`insetsLayoutMarginsFromSafeArea`** property determines whether the safe area is added to the layout margins when the view extends outside the safe area.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | On the edges where the view extends outside the [safe area](../ui-view.md#safe-area), the layout margins read back as the written value plus the safe area |
| `false` | The layout margins read back as exactly the written value |

- Readable and writable.
- The default is `true`.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- No change notification. Only the app's own code changes it.

## Examples

```js
const root = new UIViewController().view;
root.insetsLayoutMarginsFromSafeArea = false;
root.directionalLayoutMargins = { top: 16, leading: 16, bottom: 16, trailing: 16 };
```

**Effect**: The layout margins are exactly what you write, with no safe area added. A view controller's root view also has a system-defined minimum margin; see [`directionalLayoutMargins`](directionallayoutmargins.md).

## Corresponding iOS API

`UIView.insetsLayoutMarginsFromSafeArea`.

## See also

- [`directionalLayoutMargins`](directionallayoutmargins.md)
- [Layout margins](../ui-view.md#layout-margins)
