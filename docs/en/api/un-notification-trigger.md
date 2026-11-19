---
type: reference
native: UNNotificationTrigger
status: partial
---

# `UNNotificationTrigger`

**`UNNotificationTrigger`** represents when a notification is delivered. It is the common superclass of the three kinds of trigger, and cannot be created directly itself.

| Subclass | What it represents | How to get one |
| --- | --- | --- |
| [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md) | Delivered after a number of seconds | `triggerWithTimeInterval()` |
| [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md) | Delivered at the moment matching the date components | `triggerWithDateMatchingComponents()` |
| [`UNPushNotificationTrigger`](un-push-notification-trigger.md) | Delivered by a remote push | Only read from notifications the system gives |

When a trigger read back is of a kind this package does not know (a location trigger set up by other native code), what you get is a plain `UNNotificationTrigger`, with only `repeats`. Use `instanceof` to tell which kind it is.

Triggers are read-only values: their fields cannot be changed, and writing them throws `TypeError`. They are plain JS values and do not inherit from `NSObject`.

You must install `@nacrejs/user-notifications` first; for how, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: `UNNotificationTrigger`. For subclasses, see the table above.

## Constructor

Cannot be created with `new`. `new UNNotificationTrigger()` throws `TypeError`:

```
Illegal constructor: UNNotificationTrigger cannot be constructed with new; use UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()
```

## Instance properties

| Property | Description |
| --- | --- |
| [`repeats`](un-notification-trigger/repeats.md) <small>read-only</small> | Whether it restarts the timer and delivers again after delivery |

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const requests = await center.getPendingNotificationRequests();
for (const request of requests) {
  const trigger = request.trigger;
  if (trigger instanceof UNTimeIntervalNotificationTrigger) {
    console.log(request.identifier, trigger.timeInterval + ' seconds', trigger.repeats);
  } else if (trigger instanceof UNCalendarNotificationTrigger) {
    console.log(request.identifier, JSON.stringify(trigger.dateComponents), trigger.repeats);
  }
}
```

**Effect** (**not verified in the simulator**): Prints one line for each notification not yet delivered: its identifier, how it is triggered, and whether it repeats.

## Corresponding iOS API

`UNNotificationTrigger`. `[trigger isKindOfClass:UNTimeIntervalNotificationTrigger.class]` is written `trigger instanceof UNTimeIntervalNotificationTrigger`.

## See also

- [`UNNotificationRequest`](un-notification-request.md): triggers go in requests
