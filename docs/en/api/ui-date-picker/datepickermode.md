---
type: reference
native: UIDatePicker.datePickerMode
---

# `UIDatePicker`: `datePickerMode` property

The **`datePickerMode`** property decides what the picker chooses.

## Value

A string, one of these five:

| Value | What it chooses | Styles available |
| --- | --- | --- |
| `'time'` | Hours and minutes | All three |
| `'date'` | Year, month, and day | All three |
| `'dateAndTime'` | A date plus hours and minutes | All three |
| `'countDownTimer'` | A duration: hours and minutes. Read and write [`countDownDuration`](countdownduration.md) | Only `'wheels'` |
| `'yearAndMonth'` | Year and month | Only `'wheels'` |

- Readable and writable.
- The default is `'dateAndTime'`.
- Before switching to `'countDownTimer'` or `'yearAndMonth'`, [`preferredDatePickerStyle`](preferreddatepickerstyle.md) must be `'wheels'` or `'automatic'`. When it is `'automatic'`, the actual style automatically becomes `'wheels'`.
- How each mode looks on screen is **not verified in the simulator**.

### Invalid values

- Writing a value not in the table doesn't throw. The console prints a warning, and the property keeps its old value.

  ```
  [Nacre] datePickerMode has no value "week"; expected one of: time / date / dateAndTime / countDownTimer / yearAndMonth, ignored
  ```

- When the mode doesn't fit the style, it throws `TypeError`, and the property keeps its old value.

  ```
  datePickerMode "countDownTimer" only works with the wheels style, but preferredDatePickerStyle is "compact"; set it to "wheels" or "automatic" first
  ```

## Examples

```js
const picker = new UIDatePicker();
picker.datePickerMode = 'yearAndMonth';
console.log(picker.datePickerStyle);
```

**Result**: Prints `wheels`. `preferredDatePickerStyle` is the default `'automatic'`, so the actual style automatically became wheels.

## Corresponding iOS API

`UIDatePicker.datePickerMode`. `UIDatePickerModeDate` is written `'date'`, and likewise for the rest. When the mode and style don't fit, native throws a native exception JS can't catch; here it throws `TypeError`.

## See also

- [`preferredDatePickerStyle`](preferreddatepickerstyle.md)
- [`countDownDuration`](countdownduration.md)
- [Enums](../enums.md)
