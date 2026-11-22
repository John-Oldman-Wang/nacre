---
type: reference
native: UNNotificationPresentEvent.notification
---

# `UNNotificationPresentEvent`: `notification` property

The **`notification`** property is the notification that just arrived.

## Value

A [`UNNotification`](../un-notification.md). Its content is in `notification.request.content`.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (e) => {
  console.log('新消息', e.notification.request.content.body);
});
```

**Effect**: when a notification arrives while the app is in the foreground, prints `新消息` and the notification body. **Not verified in the simulator.**

## Corresponding iOS API

The `notification` parameter of `userNotificationCenter:willPresentNotification:withCompletionHandler:`.

## See also

- [`UNNotificationPresentEvent`](../un-notification-present-event.md)
