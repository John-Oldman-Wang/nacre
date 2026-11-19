---
type: reference
native: UITextField.allowsNumberPadPopover
---

# `UITextField`: `allowsNumberPadPopover` property

The **`allowsNumberPadPopover`** property indicates whether the number pad can be shown as a small panel floating next to the text field.

## Value

A boolean.

- Readable and writable.
- Apple's documentation describes this property for iPad. Nacre supports only iPhone; whether it has any effect on iPhone is **not verified in the simulator**.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- Values of other types are converted to a boolean by truthiness: `0` becomes `false` and `'false'` becomes `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.allowsNumberPadPopover = false;
console.log(field.allowsNumberPadPopover);
```

**Result**: Prints `false`.

## Corresponding iOS API

`UITextField.allowsNumberPadPopover`.

## See also

- [`keyboardType`](keyboardtype.md)
