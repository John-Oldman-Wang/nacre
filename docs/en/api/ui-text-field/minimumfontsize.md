---
type: reference
native: UITextField.minimumFontSize
---

# `UITextField`: `minimumFontSize` property

The **`minimumFontSize`** property is the smallest font size allowed when [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md) is `true`.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- The default is `0`. **Not verified in the simulator.**
- Has no effect when `adjustsFontSizeToFitWidth` is `false`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.adjustsFontSizeToFitWidth = true;
field.minimumFontSize = 12;
console.log(field.minimumFontSize);
```

**Effect**: The console prints `12`.

## Corresponding iOS API

`UITextField.minimumFontSize`.

## See also

- [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md)
