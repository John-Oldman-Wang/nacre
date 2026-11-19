---
type: reference
native: UNNotificationResponse.actionIdentifier
---

# `UNNotificationResponse`: `actionIdentifier` property

The **`actionIdentifier`** property indicates what the user did with the notification.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'default'` | The user tapped the notification, and the app was opened |
| `'dismiss'` | The user swiped the notification away. The system reports this only for notifications with a registered category that asks for dismissals to be reported; this package can't register categories yet, so dismissing a notification sent with this package produces no event |
| Any other string | The identifier of a custom button on the notification, given as is. This package can't register custom buttons yet |

- Read-only. Assigning to it throws `TypeError`: `actionIdentifier is read-only`.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  if (event.response.actionIdentifier === 'default') {
    console.log('User tapped the notification');
  }
});
```

**Effect** (**not verified in the simulator**): when the user taps a notification, prints `User tapped the notification`.

## Corresponding iOS API

`UNNotificationResponse.actionIdentifier`. `UNNotificationDefaultActionIdentifier` is written as `'default'`, and `UNNotificationDismissActionIdentifier` as `'dismiss'`.

## See also

- [`notificationclick`](../un-user-notification-center/notificationclick-event.md)
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Install first](../un-user-notification-center.md#installation)
