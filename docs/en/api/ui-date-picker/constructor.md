---
type: reference
native: "-[UIDatePicker init]"
---

# `UIDatePicker()` constructor

The **`UIDatePicker()`** constructor creates a date picker.

## Syntax

```
new UIDatePicker()
```

### Parameters

None.

### Return value

A new `UIDatePicker`:

- [`date`](date.md) is the moment of creation.
- [`datePickerMode`](datepickermode.md) is `'dateAndTime'`: both date and time are chosen.
- [`preferredDatePickerStyle`](preferreddatepickerstyle.md) is `'automatic'`; on iPhone the [`datePickerStyle`](datepickerstyle.md) actually used is `'compact'`.
- [`minimumDate`](minimumdate.md) and [`maximumDate`](maximumdate.md) are `null`: no limit.

## Examples

```js
const picker = new UIDatePicker();
console.log(picker.datePickerMode, picker.datePickerStyle);
```

**Result**: Prints `dateAndTime compact`.

## Corresponding iOS API

`[[UIDatePicker alloc] init]`.

## See also

- [`datePickerMode`](datepickermode.md): what to choose
- [`preferredDatePickerStyle`](preferreddatepickerstyle.md): what it looks like
