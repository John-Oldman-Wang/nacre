---
type: reference
native: UIDatePicker.minimumDate
---

# `UIDatePicker`: `minimumDate` property

The **`minimumDate`** property is the earliest moment that can be chosen.

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

- Neither a `Date` nor `null`: `minimumDate must be a Date, got "yesterday"`.
- An invalid `Date`: `minimumDate must be a valid Date, got an invalid one`.

## Examples

```js
const picker = new UIDatePicker();
picker.minimumDate = new Date(2027, 0, 1);
picker.date = new Date(2026, 0, 1);
console.log(picker.date.getFullYear());
```

**Result**: Prints `2027`. The written date was earlier than `minimumDate`, so it was changed to `minimumDate`.

## Corresponding iOS API

`UIDatePicker.minimumDate`; the native type is `NSDate`, here it is `Date`.

## See also

- [`maximumDate`](maximumdate.md)
- [`date`](date.md)
