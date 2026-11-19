---
type: reference
native: UNNotification
status: partial
---

# `UNNotification`

**`UNNotification`** represents a notification that has been delivered. Only the system provides it: from [`getDeliveredNotifications()`](un-user-notification-center/getdeliverednotifications.md), the [`notification`](un-user-notification-center/notification-event.md) event, and `response.notification` of the [`notificationclick`](un-user-notification-center/notificationclick-event.md) event.

It is a read-only value: its fields can't be changed, and writing one throws `TypeError`. It is a plain JS value and doesn't inherit from `NSObject`.

You need to install `@nacrejs/user-notifications` first. For how, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation), or [Core and capability packages](capabilities.md).

**Inheritance**: `UNNotification`

## Constructor

Can't be created with `new`. `new UNNotification()` throws `TypeError`:

```
Illegal constructor: UNNotification comes from the system (delivered notifications and the notification events)
```

## Instance properties

| Property | Description |
| --- | --- |
| [`date`](un-notification/date.md) <small>read-only</small> | When it was delivered |
| [`request`](un-notification/request.md) <small>read-only</small> | The request it came from |

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (event) => {
  const notification = event.notification;
  console.log(notification.request.identifier, notification.date.toISOString());
});
```

**Effect** (**not verified in the simulator**): When a notification arrives while the app is in the foreground, it prints the notification's identifier and delivery time.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `notification.date` (`NSDate`) | `notification.date` (`Date`) |
| `notification.request` | `notification.request` |

## See also

- [`UNNotificationRequest`](un-notification-request.md): the type of `request`
