---
type: reference
native: "-[UNUserNotificationCenter removeAllPendingNotificationRequests]"
---

# `UNUserNotificationCenter`: `removeAllPendingNotificationRequests()` method

The **`removeAllPendingNotificationRequests()`** method withdraws all of this app's notifications not yet delivered.

## Syntax

```
removeAllPendingNotificationRequests()
```

### Parameters

None.

### Return value

None (`undefined`).

The system withdraws them in the background, and the method returns immediately. Calling [`getPendingNotificationRequests()`](getpendingnotificationrequests.md) right afterward may still show the withdrawn notifications.

### Exceptions

None.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.removeAllPendingNotificationRequests();
```

**Effect** (**not verified in the simulator**): none of the notifications previously handed to the system and not yet arrived are delivered. Notifications already delivered are unaffected.

## Corresponding iOS API

`-[UNUserNotificationCenter removeAllPendingNotificationRequests]`.

## See also

- [`removePendingNotificationRequestsWithIdentifiers()`](removependingnotificationrequestswithidentifiers.md): withdrawing by identifier
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
