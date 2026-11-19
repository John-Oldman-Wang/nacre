---
type: reference
native: "-[UNUserNotificationCenter removeAllDeliveredNotifications]"
---

# `UNUserNotificationCenter`: `removeAllDeliveredNotifications()` method

The **`removeAllDeliveredNotifications()`** method removes all of this app's delivered notifications from Notification Center.

## Syntax

```
removeAllDeliveredNotifications()
```

### Parameters

None.

### Return value

None (`undefined`). The system does the work in the background, and the method returns immediately.

### Exceptions

None.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.removeAllDeliveredNotifications();
await center.setBadgeCount(0);
```

**Effect** (**not verified in the simulator**): all of this app's notifications disappear from Notification Center, and the number at the top right of the icon is removed. A common pattern is to do both after the user has read the messages.

## Corresponding iOS API

`-[UNUserNotificationCenter removeAllDeliveredNotifications]`.

## See also

- [`setBadgeCount()`](setbadgecount.md): removing the number on the icon
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
