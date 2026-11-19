---
type: reference
native: UIDatePicker.preferredDatePickerStyle
---

# `UIDatePicker`: `preferredDatePickerStyle` property

The **`preferredDatePickerStyle`** property is the desired style. To see the style actually used, read [`datePickerStyle`](datepickerstyle.md).

## Value

A string, one of these four:

| Value | Effect |
| --- | --- |
| `'automatic'` | The system chooses: `'wheels'` in `'countDownTimer'` and `'yearAndMonth'` modes, and `'compact'` in the other modes |
| `'wheels'` | Several columns of wheels, embedded directly in the view controller; measured at 320 × 216 [pt](../units.md) |
| `'compact'` | A small button showing the current value; tapping it pops up a calendar or wheels; measured at 36 pt high |
| `'inline'` | A calendar laid out directly in the view controller |

- Readable and writable.
- The default is `'automatic'`.
- When [`datePickerMode`](datepickermode.md) is `'countDownTimer'` or `'yearAndMonth'`, only `'wheels'` or `'automatic'` can be written.
- The sizes are measured on iOS 27.2. How each style looks on screen is **not verified in the simulator**.

### Invalid values

- Writing a value not in the table doesn't throw. The console prints a warning listing all valid values, and the property keeps its old value.
- When it doesn't fit the current mode, it throws `TypeError`, and the property keeps its old value.

  ```
  preferredDatePickerStyle "inline" does not support datePickerMode "countDownTimer"; that mode only works with "wheels" or "automatic"
  ```

## Examples

```js
const picker = new UIDatePicker();
picker.preferredDatePickerStyle = 'inline';
console.log(picker.datePickerStyle);
```

**Effect**: Prints `inline`. A full month calendar is shown directly in the view controller, without tapping to open it. **How the calendar looks is not verified in the simulator.**

## Corresponding iOS API

`UIDatePicker.preferredDatePickerStyle`. `UIDatePickerStyleWheels` is written `'wheels'`, and likewise for the rest.

## See also

- [`datePickerStyle`](datepickerstyle.md)
- [`datePickerMode`](datepickermode.md)
- [Letting the user choose a date and time](../../guides/date-pickers.md#which-style-to-choose)
