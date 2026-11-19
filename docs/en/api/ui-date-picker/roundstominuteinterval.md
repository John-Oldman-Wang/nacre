---
type: reference
native: UIDatePicker.roundsToMinuteInterval
---

# `UIDatePicker`: `roundsToMinuteInterval` property

The **`roundsToMinuteInterval`** property decides whether a [`date`](date.md) written by code is rounded to a [`minuteInterval`](minuteinterval.md) step.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | `date` is always rounded to a step |
| `false` | A `date` written by code stays exactly as written, without rounding |

- Readable and writable.
- The default is `true`.
- Written values are converted by JS truthiness.

## Examples

```js
const picker = new UIDatePicker();
picker.minuteInterval = 15;
picker.roundsToMinuteInterval = false;
const when = new Date(2027, 0, 1, 9, 7);
picker.date = when;
console.log(picker.date.getTime() === when.getTime());
```

**Result**: Prints `true`. 9:07 wasn't rounded to 9:00.

## Corresponding iOS API

`UIDatePicker.roundsToMinuteInterval`.

## See also

- [`minuteInterval`](minuteinterval.md)
