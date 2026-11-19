---
type: reference
native: UIStepper.autorepeat
---

# `UIStepper`: `autorepeat` property

The **`autorepeat`** property determines whether the value changes continuously while the user holds down the plus or minus button.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Holding a button keeps adding or subtracting |
| `false` | Each press changes the value once; holding the button still changes it only once |

The effects of both values are **not verified in the simulator**.

- Readable and writable.
- Defaults to `true`.
- Writes are converted by JS truthiness.

This property has no change notification; only your code changes it.

## Examples

```js
const stepper = new UIStepper();
stepper.autorepeat = false;
```

**Effect**: holding plus down adds to the value only once. **Not verified in the simulator.**

## Corresponding iOS API

`UIStepper.autorepeat`.

## See also

- [`isContinuous`](iscontinuous.md)
