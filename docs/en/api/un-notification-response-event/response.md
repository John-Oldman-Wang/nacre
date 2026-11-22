---
type: reference
native: UNNotificationResponseEvent.response
---

# `UNNotificationResponseEvent`: `response` property

The **`response`** property is the user's action on the notification.

## Value

A [`UNNotificationResponse`](../un-notification-response.md). `response.notification` is the notification tapped, and `response.notification.request.content.userInfo` is the data put into the content when it was created.

- Read-only. Assigning to it throws `TypeError`.
- Use `userInfo` to decide which page to open.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (e) => {
  const info = e.response.notification.request.content.userInfo;
  if (info.screen === 'order') {
    console.log('打开订单', info.orderId);
  }
});
```

**Effect**: when the user taps a notification whose `userInfo.screen` is `'order'`, prints `打开订单` and the order ID. **Not verified in the simulator.**

## Corresponding iOS API

The `response` parameter of `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`.

## See also

- [`UNNotificationResponseEvent`](../un-notification-response-event.md)
