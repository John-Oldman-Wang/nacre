---
type: reference
native: UITextField.borderStyle
---

# `UITextField`: `borderStyle` property

The **`borderStyle`** property decides the look of the text field's border.

## Value

A string, one of these four:

| Value | Effect |
| --- | --- |
| `'none'` | No border and no background color. The text sits right against the text field's left edge |
| `'line'` | A thin, square-cornered line border |
| `'bezel'` | A square-cornered border with an inset bezel effect |
| `'roundedRect'` | A rounded-rectangle border with a background color and horizontal padding around the text. The system's standard text field look |

- Readable and writable.
- The default is `'none'`.
- How each value is drawn is **not verified in the simulator**.
- For a look other than these four, put the text field inside a container and set the border, background color, and corner radius on the container; see [Drawing your own border and background](../../guides/text-fields.md#drawing-your-own-border-and-background).
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] borderStyle has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.borderStyle = 'roundedRect';
```

**Effect**: The text field has a rounded border, with spacing on both sides of the text.

## Corresponding iOS API

`UITextField.borderStyle`. `UITextBorderStyleRoundedRect` is written `'roundedRect'`, and likewise for the rest.

## See also

- [`background`](background.md)
