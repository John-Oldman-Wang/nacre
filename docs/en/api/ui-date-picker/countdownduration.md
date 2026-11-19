---
type: reference
native: UIDatePicker.countDownDuration
---

# `UIDatePicker`: `countDownDuration` property

The **`countDownDuration`** property is the selected duration in `'countDownTimer'` mode.

## Value

A number, in seconds.

- Readable and writable. Can only be written when [`datePickerMode`](datepickermode.md) is `'countDownTimer'`.
- On a picker that has never been in `'countDownTimer'` mode it reads 0; after switching to that mode it is 60.
- The range is 0 to 86399 (23 hours 59 minutes).
- Precise only to the minute: writing 125 reads back 120; writing 86399 reads back 86340.
- The minimum is 1 minute: writing a number from 0 to 59 reads back 60.

### Observing changes

[`change`](../ui-control/change-event.md) fires when the user turns the wheels. **Not verified in the simulator.**

### Invalid values

Throws `TypeError`, and the property keeps its old value.

- Written when not in countdown mode: `countDownDuration can only be set while datePickerMode is "countDownTimer"; it is "dateAndTime"`.
- Out of range: `countDownDuration must be between 0 and 86399 seconds, got 86400`.
- Can't be converted to a finite number: `countDownDuration must be a finite number, got "an hour"`.

## Examples

```js
const timer = new UIDatePicker();
timer.datePickerMode = 'countDownTimer';
timer.countDownDuration = 5 * 60;
timer.addEventListener('change', () => {
  console.log('chose', timer.countDownDuration / 60, 'minutes');
});
```

**Effect**: Two columns of wheels, hours and minutes, stopped at 0 hours 5 minutes. Turn them to 1 hour 30 minutes and the console prints `chose 90 minutes`. **Not verified in the simulator.**

## Corresponding iOS API

`UIDatePicker.countDownDuration`; the native type is `NSTimeInterval` (seconds). Native discards the written value when not in countdown mode and changes out-of-range values to 60, without errors in either case; here both throw `TypeError`.

## See also

- [`datePickerMode`](datepickermode.md)
- [Letting the user choose a date and time](../../guides/date-pickers.md#picking-a-duration)
