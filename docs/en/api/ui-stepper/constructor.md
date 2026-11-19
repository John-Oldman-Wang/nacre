---
type: reference
native: "-[UIStepper init]"
---

# `UIStepper()` constructor

The **`UIStepper()`** constructor creates a stepper.

## Syntax

```
new UIStepper()
```

### Parameters

None.

### Return value

A new `UIStepper`. Its properties have their default values:

| Property | Default |
| --- | --- |
| [`value`](value.md) | 0 |
| [`minimumValue`](minimumvalue.md) | 0 |
| [`maximumValue`](maximumvalue.md) | 100 |
| [`stepValue`](stepvalue.md) | 1 |
| [`isContinuous`](iscontinuous.md) | `true` |
| [`autorepeat`](autorepeat.md) | `true` |
| [`wraps`](wraps.md) | `false` |

The system determines the stepper's size; measured on iOS 27.2 it is 94 × 32 [pt](../units.md).

### Exceptions

None.

It cannot be subclassed: with `class MyStepper extends UIStepper {}`, `new MyStepper()` throws `TypeError`. See [Native classes](../native-classes.md).

## Examples

```js
const stepper = new UIStepper();
console.log(stepper.value, stepper.minimumValue, stepper.maximumValue, stepper.stepValue);
```

**Result**: logs `0 0 100 1`.

## Corresponding iOS API

`[[UIStepper alloc] init]`.

## See also

- [`value`](value.md)
