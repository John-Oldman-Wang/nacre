---
type: reference
native: "-[UNUserNotificationCenter getPendingNotificationRequestsWithCompletionHandler:]"
---

# `UNUserNotificationCenter`: `getPendingNotificationRequests()` method

The **`getPendingNotificationRequests()`** method reads notifications that have been handed to the system but not yet delivered.

## Syntax

```
getPendingNotificationRequests()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with an array of [`UNNotificationRequest`](../un-notification-request.md).

- Notifications delivered immediately (without `trigger`) do not appear here (**not verified in the simulator**).
- The requests read back are not the same objects originally handed over, though their contents are the same. Compare by `identifier`.
- Notifications just withdrawn may still be included; see [`removePendingNotificationRequestsWithIdentifiers()`](removependingnotificationrequestswithidentifiers.md).

### Exceptions

None.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const requests = await center.getPendingNotificationRequests();
console.log(requests.map((request) => request.identifier).join(', '));
```

**Effect** (**not verified in the simulator**): logs the identifiers of all notifications not yet delivered.

## Corresponding iOS API

`-[UNUserNotificationCenter getPendingNotificationRequestsWithCompletionHandler:]`. The completion handler is replaced by a promise.

## See also

- [`UNNotificationTrigger`](../un-notification-trigger.md): telling trigger types apart with `instanceof`
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
