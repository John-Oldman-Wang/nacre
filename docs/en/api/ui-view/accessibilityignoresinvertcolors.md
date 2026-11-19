---
type: reference
native: UIView.accessibilityIgnoresInvertColors
---

# `UIView`: `accessibilityIgnoresInvertColors` property

The **`accessibilityIgnoresInvertColors`** property determines whether this view stays as-is when the user turns on the system's Smart Invert. Photos and videos usually should stay as-is.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Not inverted; stays as-is |
| `false` | Inverted along with everything else |

- Readable and writable.
- The default is `false` (according to Apple's documentation; **not verified in the simulator**).
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

## Examples

```js
const photo = new UIImageView();
photo.accessibilityIgnoresInvertColors = true;
```

**Effect**: With Smart Invert on, the image stays as-is. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.accessibilityIgnoresInvertColors`.

## See also

- [`UIImageView`](../ui-image.md)
