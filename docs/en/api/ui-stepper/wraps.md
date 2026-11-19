---
type: reference
native: UIStepper.wraps
---

# `UIStepper`: `wraps` property

The **`wraps`** property determines what happens when the user taps again after the value reaches one end of the range.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Tapping plus at the upper bound goes back to the lower bound; tapping minus at the lower bound goes to the upper bound. Both buttons stay enabled |
| `false` | Plus is disabled at the upper bound, and minus is disabled at the lower bound |

The effects of both values are **not verified in the simulator**.

- Readable and writable.
- Defaults to `false`.
- Writes are converted by JS truthiness.
- It affects only the user tapping buttons. When code writes a [`value`](value.md) outside the range, the value is still changed to the nearer end (verified by testing).

This property has no change notification; only your code changes it.

## Examples

```js
const stepper = new UIStepper();
stepper.minimumValue = 1;
stepper.maximumValue = 10;
stepper.wraps = true;
stepper.value = 500;
console.log(stepper.value);
```

**Effect**

- The console logs `10`: values written by code do not wrap.
- Tapping plus when the value is 10 changes it to 1. **Not verified in the simulator.**

## Corresponding iOS API

`UIStepper.wraps`.

## See also

- [`minimumValue`](minimumvalue.md), [`maximumValue`](maximumvalue.md)
