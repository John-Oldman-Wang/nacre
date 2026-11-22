---
type: reference
native: "-[UNUserNotificationCenterDelegate userNotificationCenter:willPresentNotification:withCompletionHandler:]"
---

# `UNUserNotificationCenter`: `notification` event

The **`notification`** event fires when a notification arrives while the app is in the foreground. Notifications that arrive while the app is not in the foreground produce no such event.

## Syntax

```
center.addEventListener('notification', (event) => { })
```

## Event object

[`UNNotificationPresentEvent`](../un-notification-present-event.md), an `Event` with one extra field:

**[`notification`](../un-notification-present-event/notification.md)**

The notification that just arrived, a [`UNNotification`](../un-notification.md).

Not cancelable. The callback runs in the next turn after the event occurs.

## When it fires

- When a notification is delivered while the app is in the foreground. Fires for both local notifications and remote push notifications.
- How the notification is shown on screen is decided by [`foregroundPresentationOptions`](foregroundpresentationoptions.md) before the event fires; listeners cannot change it for this notification. With the default `[]` it is not shown, and there is only this event.
- Notifications that arrive with no listener are not kept: adding a listener later does not deliver them. This differs from [`notificationclick`](notificationclick-event.md).
- When it fires is **not verified in the simulator**.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (event) => {
  console.log('New message', event.notification.request.content.body);
});
```

**Effect** (**not verified in the simulator**): when a notification arrives while the app is open, the console logs "New message" and its body.

## Corresponding iOS API

The delegate method `userNotificationCenter:willPresentNotification:withCompletionHandler:`. In JS you do not set a delegate; listen for this event. The `completionHandler` you would call in that method is replaced by [`foregroundPresentationOptions`](foregroundpresentationoptions.md), set in advance.

## See also

- [`foregroundPresentationOptions`](foregroundpresentationoptions.md): how notifications arriving in the foreground are shown
- [`notificationclick`](notificationclick-event.md): the user tapped a notification
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
