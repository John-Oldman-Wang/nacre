---
type: reference
native: "+[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:repeats:]"
---

# `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval()` static method

The **`UNTimeIntervalNotificationTrigger.triggerWithTimeInterval()`** static method creates a trigger that delivers "after a number of seconds".

## Syntax

```
UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(timeInterval[, { repeats }])
```

### Parameters

**`timeInterval`**

The interval, in seconds; it must be greater than 0. Decimals are allowed. Strings that look like numbers are converted to numbers.

**`options.repeats`**

Optional, a boolean. `true`: after delivery, the timer restarts and it delivers again. Omitted means `false`. Converted by truthiness. When repeating, the interval must be at least 60 seconds.

### Return value

A new `UNTimeIntervalNotificationTrigger` whose [`timeInterval`](timeinterval.md) and [`repeats`](../un-notification-trigger/repeats.md) are the values written.

### Exceptions

**`TypeError`**

| Input | Error message |
| --- | --- |
| Not greater than 0, e.g. `0` | `triggerWithTimeInterval: timeInterval must be greater than 0, got 0` |
| Repeating and less than 60 seconds | `triggerWithTimeInterval: timeInterval must be at least 60 seconds when repeats is true, got 59` |
| Can't be converted to a finite number, e.g. `'soon'` | `timeInterval must be a finite number, got "soon"` |

## Examples

```js
const soon = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5);
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
console.log(soon.timeInterval, hourly.repeats);
```

**Result**: Prints `5 true`. A request created with `soon` is delivered once, 5 seconds later; one created with `hourly` is delivered after one hour and then every hour (**not verified in the simulator**).

## Corresponding iOS API

`+[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:repeats:]`. `repeats:` becomes an optional options object.

## See also

- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md): put the trigger in a request
- This class belongs to the `@nacrejs/user-notifications` package; see [Installation](../un-user-notification-center.md#installation)
