---
type: reference
native: "-[UNUserNotificationCenterDelegate userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:]"
---

# `UNUserNotificationCenter`: `notificationclick` event

The **`notificationclick`** event fires when the user takes an action on a notification, most commonly tapping it.

## Syntax

```
center.addEventListener('notificationclick', (event) => { })
```

## Event object

`UNNotificationResponseEvent`, an `Event` with one extra field:

**`response`**

The user's action, a [`UNNotificationResponse`](../un-notification-response.md). `response.notification` is the notification tapped, and `response.notification.request.content.userInfo` is the data originally put in the content; use it to decide which view controller to open.

Not cancelable. The callback runs in the next turn after the event occurs.

## When it fires

When the user taps a notification, the system brings the app to the foreground (launching it if it is not running), then this event fires. Fires for both local notifications and remote push notifications. The system's behavior is **not verified in the simulator**.

**Listeners receive the launch tap no matter when they are added.** When the user launches the app by tapping a notification, JS may not yet have reached the `addEventListener` line at the moment the system hands over the tap. The runtime keeps taps that arrive with no listener and delivers them the first time this event gets a listener. The rules:

- At most 8 are kept; beyond that, the oldest are dropped.
- There is no time limit; they are kept until there is a listener.
- They are cleared once delivered. Taps arriving after all listeners have been removed are likewise kept and delivered the next time there is a listener.

When the user swipes a notification away, this event fires only for notifications with a registered category that asks to report dismissals, with `actionIdentifier` `'dismiss'`. This package cannot register categories yet, so notifications sent with it produce no event when swiped away.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  const info = event.response.notification.request.content.userInfo;
  if (info.screen === 'order') {
    console.log('Open order', info.orderId);
  }
});
```

**Effect** (**not verified in the simulator**): when the user taps a notification whose `userInfo` is `{ screen: 'order', orderId: 'A1024' }`, logs "Open order A1024". The same applies when the app was launched by this tap.

## Corresponding iOS API

The delegate method `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`. In JS you do not set a delegate; listen for this event. The `response` argument is on the event object.

## See also

- [`UNNotificationResponse`](../un-notification-response.md): what `response` contains
- [`userInfo`](../un-mutable-notification-content/userinfo.md): data put into a notification
- [Sending local notifications](../../guides/local-notifications.md#carrying-data-and-getting-it-back-on-tap)
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
