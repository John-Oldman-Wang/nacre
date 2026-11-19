---
type: reference
native: "-[UNUserNotificationCenter removePendingNotificationRequestsWithIdentifiers:]"
---

# `UNUserNotificationCenter`: `removePendingNotificationRequestsWithIdentifiers()` method

The **`removePendingNotificationRequestsWithIdentifiers()`** method withdraws notifications not yet delivered, by identifier.

## Syntax

```
removePendingNotificationRequestsWithIdentifiers(identifiers)
```

### Parameters

**`identifiers`**

An array of strings. Required. Its values are converted to strings. Identifiers with no matching notification do not cause an error.

### Return value

None (`undefined`).

The system withdraws them in the background, and the method returns immediately. Calling [`getPendingNotificationRequests()`](getpendingnotificationrequests.md) right afterward may still show the withdrawn notifications.

### Exceptions

**`TypeError`**

Not an array: `removePendingNotificationRequestsWithIdentifiers: identifiers must be an array of strings, got "order-1"`.

## Description

To change a notification that has not arrived yet, you do not need to withdraw it first: hand over another request with the same identifier, and the system replaces the old one with the new one.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.removePendingNotificationRequestsWithIdentifiers(['water-reminder']);
```

**Effect** (**not verified in the simulator**): the notification with identifier `water-reminder` is no longer delivered. No error if there is no such identifier.

## Corresponding iOS API

`-[UNUserNotificationCenter removePendingNotificationRequestsWithIdentifiers:]`.

## See also

- [`removeAllPendingNotificationRequests()`](removeallpendingnotificationrequests.md): withdrawing all of them
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
