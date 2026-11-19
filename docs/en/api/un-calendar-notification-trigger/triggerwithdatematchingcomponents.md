---
type: reference
native: "+[UNCalendarNotificationTrigger triggerWithDateMatchingComponents:repeats:]"
---

# `UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()` static method

The **`UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()`** static method creates a trigger that delivers "at the moment matching these date components".

## Syntax

```
UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(dateComponents[, { repeats }])
```

### Parameters

**`dateComponents`**

A plain object containing only the components to match. Values are integers: decimals are truncated toward zero, and strings that look like numbers are converted to numbers. A component whose value is `null` or `undefined` is treated as not written.

| Component | Meaning |
| --- | --- |
| `year`, `month`, `day` | Year, month (1 to 12), day (1 to 31) |
| `hour`, `minute`, `second`, `nanosecond` | Hour (0 to 23), minute, second, nanosecond |
| `weekday` | Day of the week: 1 is Sunday, 2 is Monday, 7 is Saturday |
| `weekdayOrdinal` | Which occurrence of `weekday` in the month: 2 together with `weekday: 2` is the second Monday |
| `weekOfMonth`, `weekOfYear`, `yearForWeekOfYear` | Week of the month, week of the year, week-based year |
| `dayOfYear`, `quarter`, `era` | Day of the year, quarter (1 to 4), era (AD in the Gregorian calendar is 1) |

`{ hour: 8, minute: 30 }` matches 8:30 every day; adding `weekday: 2` makes it match only on Mondays.

It uses the calendar and time zone currently set on the user's phone. It doesn't check whether the components can form an actual moment: both `{ hour: 99 }` and `{}` create a trigger, and what happens when it's handed to the system is **not verified in the simulator**.

**`options.repeats`**

Optional, a boolean. `true`: deliver every time the components match. Omitted means `false`: deliver only at the next match. Converted by truthiness.

### Return value

A new `UNCalendarNotificationTrigger`. Its [`dateComponents`](datecomponents.md) contains only the components that were written.

### Exceptions

**`TypeError`**

| Input | Error message |
| --- | --- |
| An unrecognized component, e.g. `{ hours: 8 }` | `dateComponents has no component "hours"; expected one of: era / year / month / day / hour / minute / second / nanosecond / weekday / weekdayOrdinal / quarter / weekOfMonth / weekOfYear / yearForWeekOfYear / dayOfYear` |
| Not a plain object, e.g. `'08:30'` or `new Date()` | `dateComponents must be a plain object such as { hour: 8, minute: 30 }, got "08:30"` |
| A component that can't be converted to a finite number | `dateComponents.hour must be a finite number, got "eight"` |

## Examples

```js
const everyMorning = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { hour: 8, minute: 30 }, { repeats: true });
const firstMonday = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { weekday: 2, weekdayOrdinal: 1, hour: 9 });
console.log(everyMorning.repeats, firstMonday.repeats);
```

**Result**: Prints `true false`. `everyMorning` is delivered at 8:30 every day; `firstMonday` is delivered once, at the next "9:00 on the first Monday of the month" (**not verified in the simulator**).

## Corresponding iOS API

`+[UNCalendarNotificationTrigger triggerWithDateMatchingComponents:repeats:]`. `NSDateComponents` is written as a plain object containing only the components you need; `repeats:` becomes an optional options object.

## See also

- [`dateComponents`](datecomponents.md): read back the components that were written
- [Sending local notifications](../../guides/local-notifications.md#at-a-specific-moment): computing the components from a `Date`
- This class belongs to the `@nacrejs/user-notifications` package; see [Installation](../un-user-notification-center.md#installation)
