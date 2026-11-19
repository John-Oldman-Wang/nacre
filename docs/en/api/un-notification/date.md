---
type: reference
native: UNNotification.date
---

# `UNNotification`: `date` property

The **`date`** property is when this notification was delivered.

## Value

A `Date`.

- Read-only; assigning to it throws `TypeError`: `date is read-only`.
- Every read returns a new `Date` object. Changing the `Date` you read doesn't affect the notification.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const delivered = await center.getDeliveredNotifications();
for (const notification of delivered) {
  console.log(notification.request.identifier, notification.date.toLocaleString());
}
```

**Effect** (**not verified in the simulator**): Prints one line with the identifier and delivery time for each notification in Notification Center.

## Corresponding iOS API

`UNNotification.date`. It is an `NSDate` in ObjC and a `Date` here.

## See also

- [`UNNotification`](../un-notification.md)
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
