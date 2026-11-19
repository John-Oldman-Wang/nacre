---
type: reference
native: UNNotification.request
---

# `UNNotification`: `request` property

The **`request`** property is the request this notification came from: the identifier, content, and trigger are all on it.

## Value

A [`UNNotificationRequest`](../un-notification-request.md).

- Read-only; assigning to it throws `TypeError`: `request is read-only`.
- Remote push notifications have one too; its `trigger` is a [`UNPushNotificationTrigger`](../un-push-notification-trigger.md), and `content.userInfo` is the push payload.
- It isn't the same object that was originally handed to the system, but its content is the same.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (event) => {
  const request = event.notification.request;
  console.log(request.identifier, request.content.title);
});
```

**Effect** (**not verified in the simulator**): When a notification arrives while the app is in the foreground, it prints the notification's identifier and title.

## Corresponding iOS API

`UNNotification.request`.

## See also

- [`UNNotificationRequest`](../un-notification-request.md)
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
