---
type: reference
native: UIStepper.value
---

# `UIStepper`: `value` property

The **`value`** property is the stepper's current value.

## Value

A number with no unit. It is a double-precision floating-point number: writing 0.3 reads back 0.3.

- Readable and writable.
- Defaults to 0.
- Writes are converted with `Number()`, so `'5'` gives 5.
- A value outside [`minimumValue`](minimumvalue.md) to [`maximumValue`](maximumvalue.md) is changed to the nearer end: with a range of 0 to 100, writing 500 reads back 100. The same holds with [`wraps`](wraps.md) on; `wraps` affects only the user tapping buttons.
- The stepper does not align the value to multiples of [`stepValue`](stepvalue.md): after writing 0.3, tapping plus gives 1.3 (when `stepValue` is 1). **The value after tapping plus is not verified in the simulator**; writing 0.3 and reading back 0.3 is verified by testing.

### Observing changes

[`change`](../ui-control/change-event.md) fires when the user taps plus or minus. Writing `value` in code does not fire it. The acceptance tests assert that no `change` arrives after a write.

### Invalid values

A value that cannot be converted to a finite number (`'many'`, `undefined`, `NaN`) throws `TypeError`, and the property keeps its previous value:

```
TypeError: value must be a finite number, got "many"
```

## Examples

```js
const stepper = new UIStepper();
stepper.maximumValue = 10;
stepper.value = 500;
console.log(stepper.value);
```

**Result**: logs `10`.

## Corresponding iOS API

`UIStepper.value`.

## See also

- [`minimumValue`](minimumvalue.md), [`maximumValue`](maximumvalue.md)
- The [`change`](../ui-control/change-event.md) event
