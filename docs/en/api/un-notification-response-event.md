---
type: reference
native: UNNotificationResponseEvent
---

# `UNNotificationResponseEvent`

**`UNNotificationResponseEvent`** represents the user tapping a notification.

The [`notificationclick`](un-user-notification-center/notificationclick-event.md) event of [`UNUserNotificationCenter`](un-user-notification-center.md) is this class, and [`response`](un-notification-response-event/response.md) is the user's action.

It belongs to the `@nacrejs/user-notifications` package; for installation, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation).

**Inheritance**: [`Event`](event.md) → `UNNotificationResponseEvent`

## Constructor

[`UNNotificationResponseEvent()`](un-notification-response-event/constructor.md)

Creates a `UNNotificationResponseEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`response`](un-notification-response-event/response.md) <small>read-only</small> | The user's action |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UNUserNotificationCenter`](un-user-notification-center.md) | [`notificationclick`](un-user-notification-center/notificationclick-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (e) => {
  console.log(e instanceof UNNotificationResponseEvent, e.response.actionIdentifier);
});
```

**Effect**: when the user taps a notification, prints `true` and the action identifier. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:` | The `notificationclick` event |
| The `response` parameter | `event.response` |

## See also

- [`UNUserNotificationCenter`](un-user-notification-center.md): the object that fires this event
- [`UNNotificationResponse`](un-notification-response.md)
