---
type: reference
native: UIStepper.maximumValue
---

# `UIStepper`: `maximumValue` property

The **`maximumValue`** property is the upper bound of the stepper's range. When the value equals it, the plus button is disabled (when [`wraps`](wraps.md) is `false`).

## Value

A number with no unit.

- Readable and writable.
- Defaults to 100.
- Writes are converted with `Number()`.
- If [`value`](value.md) is above it after the write, `value` becomes it.

This property has no change notification; only your code changes it.

### Invalid values

A value that cannot be converted to a finite number throws `TypeError`, and the property keeps its previous value:

```
TypeError: maximumValue must be a finite number, got "high"
```

## Examples

```js
const stepper = new UIStepper();
stepper.value = 50;
stepper.maximumValue = 10;
console.log(stepper.value);
```

**Result**: logs `10`. When the upper bound is lowered, the value follows it down.

## Corresponding iOS API

`UIStepper.maximumValue`.

## See also

- [`minimumValue`](minimumvalue.md)
