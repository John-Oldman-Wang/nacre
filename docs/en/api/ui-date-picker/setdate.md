---
type: reference
native: "-[UIDatePicker setDate:animated:]"
---

# `UIDatePicker`: `setDate()` method

The **`setDate()`** method changes the moment selected in the picker, optionally animated. The only difference from writing [`date`](date.md) is the animation.

## Syntax

```
setDate(date[, { animated }])
```

### Parameters

**`date`**

The moment to select, a `Date`. Strings and timestamps aren't converted. A value earlier than [`minimumDate`](minimumdate.md) or later than [`maximumDate`](maximumdate.md) doesn't throw; it is changed to the nearest limit.

**`options.animated`** <small>optional</small>

A boolean. `true`: in the wheels style, the wheels spin to the new value. If omitted, there is no animation.

### Return value

None (`undefined`).

When animated, [`date`](date.md) already has the new value when the method returns.

Doesn't fire [`change`](../ui-control/change-event.md).

### Exceptions

**`TypeError`**

- `date` isn't a `Date`: `setDate must be a Date, got 1700000000000`.
- `date` is an invalid `Date`: `setDate must be a valid Date, got an invalid one`.

After it throws, the selected moment is unchanged.

## Examples

```js
const picker = new UIDatePicker();
picker.preferredDatePickerStyle = 'wheels';
picker.setDate(new Date(2027, 0, 1), { animated: true });
console.log(picker.date.getFullYear());
```

**Effect**: Prints `2027`. The wheels spin to January 1, 2027. **The wheels spinning is not verified in the simulator.**

## Corresponding iOS API

`-[UIDatePicker setDate:animated:]`. `animated` is a required parameter in native; here it can be omitted.

## See also

- [`date`](date.md)
