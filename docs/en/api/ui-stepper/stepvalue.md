---
type: reference
native: UIStepper.stepValue
---

# `UIStepper`: `stepValue` property

The **`stepValue`** property is how much [`value`](value.md) changes each time the user taps plus or minus.

## Value

A number with no unit; it must be greater than 0.

- Readable and writable.
- Defaults to 1.
- Writes are converted with `Number()`.
- It only determines the change when a button is tapped. Values written by code are not aligned to it.

This property has no change notification; only your code changes it.

### Invalid values

Writing 0 or a negative number throws `TypeError`, and the property keeps its previous value:

```
TypeError: stepValue must be greater than 0, got 0
```

A value that cannot be converted to a finite number also throws `TypeError`: `stepValue must be a finite number, got …`.

## Examples

```js
const stepper = new UIStepper();
stepper.stepValue = 0.5;
stepper.value = 1;
```

**Effect**: tapping plus once changes the value from 1 to 1.5. **Not verified in the simulator.**

## Corresponding iOS API

`UIStepper.stepValue`. Natively, writing 0 or a negative number raises `NSInvalidArgumentException`; here it is caught beforehand and `TypeError` is thrown.

## See also

- [`value`](value.md)
