---
type: reference
native: UIStepper.continuous
---

# `UIStepper`: `isContinuous` property

The **`isContinuous`** property determines when [`change`](../ui-control/change-event.md) fires while the user holds a button and the value changes continuously.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | While held, `change` fires on every change |
| `false` | While held, the value still changes but nothing fires; `change` fires once after release |

The effects of both values are **not verified in the simulator**.

- Readable and writable.
- Defaults to `true`.
- Writes are converted by JS truthiness.
- It makes a difference only when [`autorepeat`](autorepeat.md) is `true`.

This property has no change notification; only your code changes it.

## Examples

```js
const stepper = new UIStepper();
stepper.isContinuous = false;
stepper.addEventListener('change', () => {
  console.log('Settled', stepper.value);
});
```

**Effect**: while plus is held, the value keeps increasing but nothing is logged. One line is logged after release. **Not verified in the simulator.**

## Corresponding iOS API

`UIStepper.continuous`, whose getter is `isContinuous`.

## See also

- [`autorepeat`](autorepeat.md)
