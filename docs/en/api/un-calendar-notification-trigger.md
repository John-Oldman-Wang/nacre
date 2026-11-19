---
type: reference
native: UNCalendarNotificationTrigger
status: partial
---

# `UNCalendarNotificationTrigger`

**`UNCalendarNotificationTrigger`** represents a trigger that delivers "at the moment matching these date components". Write only the components to match: `{ hour: 8, minute: 30 }` matches 8:30 every day. When set to repeat, it delivers every time the components match; when not repeating, it delivers only at the next match.

It uses the calendar and time zone currently set on the user's phone. If the user changes the phone's time or time zone, it follows the new clock.

It's a read-only value, a plain JS object that doesn't inherit from `NSObject`.

You need to install `@nacrejs/user-notifications` first. See [`UNUserNotificationCenter`](un-user-notification-center.md#installation) for how, or see [Core and capability packages](capabilities.md).

**Inheritance**: [`UNNotificationTrigger`](un-notification-trigger.md) → `UNCalendarNotificationTrigger`

## Constructor

You can't create one with `new`; `new` throws `TypeError`:

```
Illegal constructor: UNCalendarNotificationTrigger cannot be constructed with new; use UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()
```

## Static methods

[`UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()`](un-calendar-notification-trigger/triggerwithdatematchingcomponents.md)

Creates a trigger from date components.

## Instance properties

It also inherits [`repeats`](un-notification-trigger/repeats.md) from [`UNNotificationTrigger`](un-notification-trigger.md).

| Property | Description |
| --- | --- |
| [`dateComponents`](un-calendar-notification-trigger/datecomponents.md) <small>read-only</small> | The components to match; only the ones that were written |

## Examples

```js
const everyMorning = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { hour: 8, minute: 30 }, { repeats: true });
console.log(JSON.stringify(everyMorning.dateComponents));
```

**Result**: Prints `{"hour":8,"minute":30}`. A request created with it is delivered at 8:30 every day (**not verified in the simulator**).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `NSDateComponents *c = [NSDateComponents new]; c.hour = 8; c.minute = 30;` | `{ hour: 8, minute: 30 }` |
| `[UNCalendarNotificationTrigger triggerWithDateMatchingComponents:c repeats:YES]` | `UNCalendarNotificationTrigger.triggerWithDateMatchingComponents({ hour: 8, minute: 30 }, { repeats: true })` |
| `c.day == NSDateComponentUndefined` | `trigger.dateComponents.day === undefined` |

## See also

- [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md): delivered after a number of seconds
- [Sending local notifications](../guides/local-notifications.md#at-a-fixed-time-every-day)
