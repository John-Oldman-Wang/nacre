---
type: reference
native: UIToolbar.translucent
---

# `UIToolbar`: `isTranslucent` property

The **`isTranslucent`** property indicates whether the toolbar's background is translucent.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The bar's background is translucent, letting the content below show through |
| `false` | The bar's background is opaque |

- Readable and writable.
- Defaults to `true`.
- The visual difference between the two values is **not verified in the simulator**.
- Values of other types are converted to booleans by truthiness: `0` is `false`, and `'false'` is `true`.
- No change event: only the app's own code changes it.

## Examples

```js
const toolbar = new UIToolbar();
toolbar.isTranslucent = false;
console.log(toolbar.isTranslucent);
```

**Result**: prints `false`.

## Corresponding iOS API

`UIToolbar.translucent` (the getter is `isTranslucent`).

## See also

- [`barTintColor`](bartintcolor.md): the bar's background color
