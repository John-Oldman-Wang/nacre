---
type: reference
native: UIDatePicker.minuteInterval
---

# `UIDatePicker`: `minuteInterval` property

The **`minuteInterval`** property is how many minutes apart the steps in the minute column are.

## Value

A number, in minutes.

- Readable and writable.
- The default is 1.
- It must divide 60 evenly and be between 1 and 30: 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30.
- Written values are first converted to a number, with fractions truncated toward zero.
- Once it is set, [`date`](date.md) is immediately rounded to a step, and dates written afterward are rounded too; see [`roundsToMinuteInterval`](roundstominuteinterval.md). Measured with 15-minute steps: 22:14:02 became 22:00:02 — the minutes are rounded down to a step, the seconds are kept, and the milliseconds are dropped.

### Invalid values

Throws `TypeError`, and the property keeps its old value.

- Doesn't divide 60 evenly or isn't between 1 and 30: `minuteInterval must divide 60 evenly and be between 1 and 30, got 7`.
- Can't be converted to a finite number: `minuteInterval must be a finite number, got "quarter"`.

## Examples

```js
const picker = new UIDatePicker();
picker.datePickerMode = 'time';
picker.minuteInterval = 15;
```

**Effect**: The picker has only hours and minutes, and the minutes have only four options: 00, 15, 30, and 45. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`UIDatePicker.minuteInterval`. For invalid values, native does nothing and doesn't report an error; here it throws `TypeError`.

## See also

- [`roundsToMinuteInterval`](roundstominuteinterval.md)
