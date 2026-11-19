---
type: reference
native: UITextField.font
---

# `UITextField`: `font` property

The **`font`** property is the font and size of the text in the field.

## Value

A [`UIFont`](../ui-font.md).

- Readable and writable.
- The default value is **not verified in the simulator**.
- The text field computes its own height from the font.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.font = UIFont.systemFontOfSize(20);
```

**Effect**: The text in the field is 20 pt. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.font`.

## See also

- [`UIFont`](../ui-font.md)
- [`textColor`](textcolor.md)
