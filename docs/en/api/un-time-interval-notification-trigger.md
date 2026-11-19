---
type: reference
native: UNTimeIntervalNotificationTrigger
status: partial
---

# `UNTimeIntervalNotificationTrigger`

**`UNTimeIntervalNotificationTrigger`** represents a trigger that delivers "after a number of seconds". It can be set to repeat: after delivery, the timer restarts and it delivers again.

If the user changes the phone's time or time zone, it's still "this long after it was handed to the system". To follow the clock, use [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md).

It's a read-only value, a plain JS object that doesn't inherit from `NSObject`.

You need to install `@nacrejs/user-notifications` first. See [`UNUserNotificationCenter`](un-user-notification-center.md#installation) for how, or see [Core and capability packages](capabilities.md).

**Inheritance**: [`UNNotificationTrigger`](un-notification-trigger.md) → `UNTimeIntervalNotificationTrigger`

## Constructor

You can't create one with `new`; `new` throws `TypeError`:

```
Illegal constructor: UNTimeIntervalNotificationTrigger cannot be constructed with new; use UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()
```

## Static methods

[`UNTimeIntervalNotificationTrigger.triggerWithTimeInterval()`](un-time-interval-notification-trigger/triggerwithtimeinterval.md)

Creates a trigger that delivers after a number of seconds.

## Instance properties

It also inherits [`repeats`](un-notification-trigger/repeats.md) from [`UNNotificationTrigger`](un-notification-trigger.md).

| Property | Description |
| --- | --- |
| [`timeInterval`](un-time-interval-notification-trigger/timeinterval.md) <small>read-only</small> | The interval, in seconds |

## Examples

```js
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
console.log(hourly.timeInterval, hourly.repeats);
```

**Result**: Prints `3600 true`. A request created with it is delivered after one hour, and then every hour until it's cancelled (**not verified in the simulator**).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:5 repeats:NO]` | `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5)` |
| `[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:3600 repeats:YES]` | `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true })` |

## See also

- [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md): delivers at a date and time
- [Sending local notifications](../guides/local-notifications.md#repeating-at-an-interval)
