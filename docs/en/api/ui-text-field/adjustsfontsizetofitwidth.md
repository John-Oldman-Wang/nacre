---
type: reference
native: UITextField.adjustsFontSizeToFitWidth
---

# `UITextField`: `adjustsFontSizeToFitWidth` property

The **`adjustsFontSizeToFitWidth`** property indicates whether the font size shrinks when the content is wider than the field.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | When the content is wider than the field, the font size shrinks, down to [`minimumFontSize`](minimumfontsize.md) |
| `false` | The font size stays the same; content that overflows scrolls horizontally |

- Readable and writable.
- The default is `false`. **Not verified in the simulator.**
- The effect of both values is **not verified in the simulator**.
- Values of other types are converted to a boolean by truthiness: `0` becomes `false` and `'false'` becomes `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.adjustsFontSizeToFitWidth = true;
field.minimumFontSize = 12;
```

**Effect**: When the content does not fit, the font size gradually shrinks, down to 12 pt. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.adjustsFontSizeToFitWidth`.

## See also

- [`minimumFontSize`](minimumfontsize.md)
