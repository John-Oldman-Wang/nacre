---
type: reference
native: UIDatePicker.datePickerStyle
---

# `UIDatePicker`: `datePickerStyle` property

The **`datePickerStyle`** property is the style the picker actually uses.

## Value

A string: `'wheels'`, `'compact'`, or `'inline'`. Never `'automatic'`.

- Read-only; assigning to it throws `TypeError`.
- A new picker on iPhone is `'compact'`.
- When [`preferredDatePickerStyle`](preferreddatepickerstyle.md) isn't `'automatic'`, it is the same. When it is `'automatic'`, the system chooses based on [`datePickerMode`](datepickermode.md): `'wheels'` for `'countDownTimer'` and `'yearAndMonth'`, and `'compact'` for the rest.
- Its changes don't fire events. It only changes when you write `preferredDatePickerStyle` and `datePickerMode`.

## Examples

```js
const picker = new UIDatePicker();
console.log(picker.datePickerStyle);
picker.preferredDatePickerStyle = 'wheels';
console.log(picker.datePickerStyle);
```

**Result**: Prints `compact` and then `wheels`.

## Corresponding iOS API

`UIDatePicker.datePickerStyle`.

## See also

- [`preferredDatePickerStyle`](preferreddatepickerstyle.md)
