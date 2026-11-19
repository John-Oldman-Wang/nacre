---
type: reference
native: "-[UNUserNotificationCenter removeDeliveredNotificationsWithIdentifiers:]"
---

# `UNUserNotificationCenter`: `removeDeliveredNotificationsWithIdentifiers()` method

The **`removeDeliveredNotificationsWithIdentifiers()`** method removes delivered notifications from Notification Center by identifier.

## Syntax

```
removeDeliveredNotificationsWithIdentifiers(identifiers)
```

### Parameters

**`identifiers`**

An array of strings. Required. Its values are converted to strings. Identifiers with no matching notification do not cause an error.

### Return value

None (`undefined`).

The system does the work in the background, and the method returns immediately. Calling [`getDeliveredNotifications()`](getdeliverednotifications.md) right afterward may still show the removed notifications.

### Exceptions

**`TypeError`**

Not an array: `removeDeliveredNotificationsWithIdentifiers: identifiers must be an array of strings, got "order-1"`.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.removeDeliveredNotificationsWithIdentifiers(['order-A1024']);
```

**Effect** (**not verified in the simulator**): the notification with identifier `order-A1024` disappears from Notification Center.

## Corresponding iOS API

`-[UNUserNotificationCenter removeDeliveredNotificationsWithIdentifiers:]`.

## See also

- [`removeAllDeliveredNotifications()`](removealldeliverednotifications.md): removing all of them
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
