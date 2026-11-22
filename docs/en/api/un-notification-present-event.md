---
type: reference
native: UNNotificationPresentEvent
---

# `UNNotificationPresentEvent`

**`UNNotificationPresentEvent`** represents a notification arriving while the app is in the foreground.

The [`notification`](un-user-notification-center/notification-event.md) event of [`UNUserNotificationCenter`](un-user-notification-center.md) is this class, and [`notification`](un-notification-present-event/notification.md) is the one that just arrived.

It belongs to the `@nacrejs/user-notifications` package; for installation, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation).

**Inheritance**: [`Event`](event.md) → `UNNotificationPresentEvent`

## Constructor

[`UNNotificationPresentEvent()`](un-notification-present-event/constructor.md)

Creates a `UNNotificationPresentEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`notification`](un-notification-present-event/notification.md) <small>read-only</small> | The notification that just arrived |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UNUserNotificationCenter`](un-user-notification-center.md) | [`notification`](un-user-notification-center/notification-event.md) |

It can't be canceled: `cancelable` is `false`. How the notification is presented on screen is decided before the event is fired, by [`foregroundPresentationOptions`](un-user-notification-center/foregroundpresentationoptions.md).

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (e) => {
  console.log(e instanceof UNNotificationPresentEvent, e.notification.request.identifier);
});
```

**Effect**: when a notification arrives while the app is in the foreground, prints `true` and the notification's identifier. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `userNotificationCenter:willPresentNotification:withCompletionHandler:` | The `notification` event |
| The `notification` parameter | `event.notification` |
| `completionHandler(options)` | [`foregroundPresentationOptions`](un-user-notification-center/foregroundpresentationoptions.md), set beforehand |

## See also

- [`UNUserNotificationCenter`](un-user-notification-center.md): the object that fires this event
- [`UNNotification`](un-notification.md)
