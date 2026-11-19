---
type: reference
native: "-[UNUserNotificationCenter getDeliveredNotificationsWithCompletionHandler:]"
---

# `UNUserNotificationCenter`: `getDeliveredNotifications()` method

The **`getDeliveredNotifications()`** method reads notifications that have been delivered and are still in Notification Center.

## Syntax

```
getDeliveredNotifications()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with an array of [`UNNotification`](../un-notification.md). Notifications the user swiped away or tapped are not included (**not verified in the simulator**).

### Exceptions

None.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const delivered = await center.getDeliveredNotifications();
console.log(delivered.length + ' still in Notification Center');
```

**Effect** (**not verified in the simulator**): logs how many of this app's notifications are in Notification Center.

## Corresponding iOS API

`-[UNUserNotificationCenter getDeliveredNotificationsWithCompletionHandler:]`. The completion handler is replaced by a promise.

## See also

- [`removeDeliveredNotificationsWithIdentifiers()`](removedeliverednotificationswithidentifiers.md): removing them from Notification Center
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
