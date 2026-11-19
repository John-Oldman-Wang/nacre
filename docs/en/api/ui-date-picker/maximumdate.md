---
type: reference
native: UIDatePicker.maximumDate
---

# `UIDatePicker`: `maximumDate` property

The **`maximumDate`** property is the latest moment that can be chosen.

## Value

A `Date`, or `null`.

- Readable and writable.
- The default is `null`: no limit.
- Writing `null` or `undefined` both mean no limit.
- Every read returns a new `Date` object.
- Once it is set, a [`date`](date.md) outside the range is changed to this limit. The user can't choose a moment outside the range in the picker either. **That it can't be chosen is not verified in the simulator.**
- When `minimumDate` is later than `maximumDate`, it doesn't throw, and neither limit takes effect.
- Its changes don't fire events. The limits only change through your code.

### Invalid values

Throws `TypeError`, and the property keeps its old value.

- Neither a `Date` nor `null`: `maximumDate must be a Date, got "yesterday"`.
- An invalid `Date`: `maximumDate must be a valid Date, got an invalid one`.

## Examples

```js
const picker = new UIDatePicker();
const today = new Date();
picker.minimumDate = today;
picker.maximumDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
```

**Effect**: Only today through 30 days from now can be chosen. Days outside the range are gray in the calendar. **Not verified in the simulator.**

## Corresponding iOS API

`UIDatePicker.maximumDate`; the native type is `NSDate`, here it is `Date`.

## See also

- [`minimumDate`](minimumdate.md)
- [`date`](date.md)
