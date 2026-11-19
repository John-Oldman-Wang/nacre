---
type: reference
native: UIStepper.minimumValue
---

# `UIStepper`: `minimumValue` property

The **`minimumValue`** property is the lower bound of the stepper's range. When the value equals it, the minus button is disabled (when [`wraps`](wraps.md) is `false`).

## Value

A number with no unit.

- Readable and writable.
- Defaults to 0.
- Writes are converted with `Number()`.
- If [`value`](value.md) is below it after the write, `value` becomes it.
- Writing a value larger than [`maximumValue`](maximumvalue.md) does not throw: testing shows the upper bound is changed to equal the lower bound, and `value` becomes that number too.

This property has no change notification; only your code changes it.

### Invalid values

A value that cannot be converted to a finite number throws `TypeError`, and the property keeps its previous value:

```
TypeError: minimumValue must be a finite number, got "low"
```

## Examples

```js
const stepper = new UIStepper();
stepper.minimumValue = 200;
console.log(stepper.maximumValue, stepper.value);
```

**Result**: logs `200 200`.

## Corresponding iOS API

`UIStepper.minimumValue`. Apple's header requires the lower bound to be less than the upper bound; in practice writing a larger value does not throw, and behaves as described above.

## See also

- [`maximumValue`](maximumvalue.md)
