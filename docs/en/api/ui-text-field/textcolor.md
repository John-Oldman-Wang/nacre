---
type: reference
native: UITextField.textColor
---

# `UITextField`: `textColor` property

The **`textColor`** property is the color of the text in the field.

## Value

A [color](../ui-color.md) string.

- Readable and writable. You can write a color string, a `UIColor` object, or `null`; reading it returns a string.
- The default value is **not verified in the simulator**.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing an unrecognized color string does not throw: the console prints a warning and the previous color is kept; see [Colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const field = new UITextField();
field.textColor = 'systemBlue';
```

**Effect**: The text in the field is blue. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.textColor`. `UIColor.labelColor` is written `'label'`; see [Colors](../ui-color.md).

## See also

- [Colors](../ui-color.md)
- [`font`](font.md)
