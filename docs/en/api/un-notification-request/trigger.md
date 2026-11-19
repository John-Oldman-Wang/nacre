---
type: reference
native: UNNotificationRequest.trigger
---

# `UNNotificationRequest`: `trigger` property

The **`trigger`** property is when the notification is delivered.

## Value

A subclass of [`UNNotificationTrigger`](../un-notification-trigger.md), or `null`.

- `null`: delivered immediately.
- [`UNTimeIntervalNotificationTrigger`](../un-time-interval-notification-trigger.md): delivered after a number of seconds.
- [`UNCalendarNotificationTrigger`](../un-calendar-notification-trigger.md): delivered at the moment that matches the date components.
- [`UNPushNotificationTrigger`](../un-push-notification-trigger.md): delivered by a remote push; it appears only in notifications provided by the system.
- When the trigger in a notification provided by the system is of a kind this package doesn't recognize, it's a `UNNotificationTrigger` with only `repeats`.
- Read-only. Assigning to it throws `TypeError`: `trigger is read-only`.

Use `instanceof` to tell which kind it is.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const requests = await center.getPendingNotificationRequests();
for (const request of requests) {
  const trigger = request.trigger;
  if (trigger instanceof UNTimeIntervalNotificationTrigger) {
    console.log(request.identifier, trigger.timeInterval + ' seconds');
  } else if (trigger instanceof UNCalendarNotificationTrigger) {
    console.log(request.identifier, JSON.stringify(trigger.dateComponents));
  }
}
```

**Effect** (**not verified in the simulator**): For each notification that hasn't been delivered yet, prints a line with its identifier and trigger.

## Corresponding iOS API

`UNNotificationRequest.trigger`. `isKindOfClass:` is written as `instanceof`.

## See also

- [`UNNotificationTrigger`](../un-notification-trigger.md)
- This class belongs to the `@nacrejs/user-notifications` package; see [Installation](../un-user-notification-center.md#installation)
