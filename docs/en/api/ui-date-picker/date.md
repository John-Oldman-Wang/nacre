---
type: reference
native: UIDatePicker.date
---

# `UIDatePicker`: `date` property

The **`date`** property is the moment selected in the picker.

## Value

A `Date`.

- Readable and writable.
- The default is the moment the picker was created.
- Precise to the millisecond: milliseconds written are preserved on read. When [`minuteInterval`](minuteinterval.md) isn't 1, it is rounded; see [`roundsToMinuteInterval`](roundstominuteinterval.md).
- Every read returns a new `Date` object: `picker.date !== picker.date`. Changing that object doesn't affect the picker; to change the selected moment, write `date`.
- Writes accept only a `Date`; strings and timestamps aren't converted.
- A value earlier than [`minimumDate`](minimumdate.md) or later than [`maximumDate`](maximumdate.md) doesn't throw; it is changed to the nearest limit.
- `date` is a moment in time with no time zone. The picker displays it in the device's time zone. In the date-only mode, get the year, month, and day with `getFullYear()`, `getMonth()`, and `getDate()`; don't compare the milliseconds of two `date` values directly to decide whether they are the same day.
- In `'countDownTimer'` mode, the selected duration isn't in `date`; it is in [`countDownDuration`](countdownduration.md).

### Observing changes

When the user changes the selection, the control fires [`change`](../ui-control/change-event.md). Writes from code don't fire it: in the acceptance tests, no `change` arrived within 300 milliseconds after a write.

### Invalid values

Throws `TypeError`, and the property keeps its old value.

- Not a `Date` (a string, a number): `date must be a Date, got "2026-01-01"`.
- Writing `null`: `date must be a Date, got null`.
- An invalid `Date` (such as `new Date('abc')`): `date must be a valid Date, got an invalid one`.

## Examples

```js
const picker = new UIDatePicker();
picker.date = new Date(2027, 0, 1);
console.log(picker.date.getFullYear(), picker.date.getMonth() + 1, picker.date.getDate());
picker.addEventListener('change', () => {
  console.log('chose', picker.date.toLocaleString());
});
```

**Effect**: First prints `2027 1 1`. Months in `new Date(2027, 0, 1)` count from 0, so 0 is January. After the user changes the selection, the console prints the selected moment. **The effect of user interaction is not verified in the simulator.**

## Corresponding iOS API

`UIDatePicker.date`; the native type is `NSDate`, here it is `Date`.

## See also

- [`setDate()`](setdate.md): change it with an animation
- [`change`](../ui-control/change-event.md) event
- [`Intl.DateTimeFormat`](../intl-date.md): format a date as text for a region
