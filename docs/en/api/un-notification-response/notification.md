---
type: reference
native: UNNotificationResponse.notification
---

# `UNNotificationResponse`: `notification` property

The **`notification`** property is the notification the user acted on.

## Value

A [`UNNotification`](../un-notification.md).

- Read-only. Assigning to it throws `TypeError`: `notification is read-only`.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  const info = event.response.notification.request.content.userInfo;
  console.log(JSON.stringify(info));
});
```

**Effect** (**not verified in the simulator**): when the user taps a notification, prints the data originally put in its content.

## Corresponding iOS API

`UNNotificationResponse.notification`.

## See also

- [`notificationclick`](../un-user-notification-center/notificationclick-event.md)
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Install first](../un-user-notification-center.md#installation)
