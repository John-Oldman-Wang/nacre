---
type: reference
native: UNNotificationResponse
status: partial
---

# `UNNotificationResponse`

**`UNNotificationResponse`** represents an action the user took on a notification, such as tapping it. It only comes from the `response` of the [`notificationclick`](un-user-notification-center/notificationclick-event.md) event.

It's a read-only value: its fields can't be changed, and writing throws `TypeError`. It's a plain JS value and doesn't inherit from `NSObject`.

You need to install `@nacrejs/user-notifications` first; for how, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: `UNNotificationResponse`

## Constructor

It can't be created with `new`. `new UNNotificationResponse()` throws `TypeError`:

```
Illegal constructor: UNNotificationResponse comes from the notificationclick event
```

## Instance properties

| Property | Description |
| --- | --- |
| [`notification`](un-notification-response/notification.md) <small>read-only</small> | Which notification |
| [`actionIdentifier`](un-notification-response/actionidentifier.md) <small>read-only</small> | What the user did |

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  const response = event.response;
  if (response.actionIdentifier === 'default') {
    console.log('Tapped', response.notification.request.identifier);
  }
});
```

**Effect** (**not verified in the simulator**): when the user taps a notification, its identifier is printed.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[response.actionIdentifier isEqualToString:UNNotificationDefaultActionIdentifier]` | `response.actionIdentifier === 'default'` |
| `[response.actionIdentifier isEqualToString:UNNotificationDismissActionIdentifier]` | `response.actionIdentifier === 'dismiss'` |

## See also

- [`notificationclick`](un-user-notification-center/notificationclick-event.md): where actions come from
