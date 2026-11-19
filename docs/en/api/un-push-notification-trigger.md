---
type: reference
native: UNPushNotificationTrigger
status: partial
---

# `UNPushNotificationTrigger`

**`UNPushNotificationTrigger`** indicates that a notification arrived as a remote push: sent by a server through Apple's push service to the phone. It is only ever read from notifications the system hands over — delivered notifications, and the notifications in the two events — whose `request.trigger` is this class.

It has no members of its own, only the inherited [`repeats`](un-notification-trigger/repeats.md). It is used with `instanceof`: to tell whether a notification is local or a remote push.

It is a read-only value: a plain JS object that does not inherit from `NSObject`.

Install `@nacrejs/user-notifications` first. For how, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: [`UNNotificationTrigger`](un-notification-trigger.md) → `UNPushNotificationTrigger`

## Constructor

Cannot be created with `new`; `new` throws `TypeError`:

```
Illegal constructor: UNPushNotificationTrigger cannot be constructed with new; use UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()
```

It also cannot be put into a request: `requestWithIdentifier()` accepts only the other two kinds of trigger.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  const request = event.response.notification.request;
  if (request.trigger instanceof UNPushNotificationTrigger) {
    console.log('Push payload', JSON.stringify(request.content.userInfo));
  }
});
```

**Effect** (**not verified in the simulator**): when the user taps a notification that came from a remote push, its payload is printed — the JSON object the server sent.

## Corresponding iOS API

`UNPushNotificationTrigger`. `[trigger isKindOfClass:UNPushNotificationTrigger.class]` is written as `trigger instanceof UNPushNotificationTrigger`.

## See also

- [Sending local notifications](../guides/local-notifications.md#receiving-remote-push-notifications)
