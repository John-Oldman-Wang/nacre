---
type: reference
native: UNNotificationRequest.identifier
---

# `UNNotificationRequest`: `identifier` property

The **`identifier`** property is the notification's identifier, chosen by the app when it creates the request.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`: `identifier is read-only`.
- Cancelling a notification or removing it from Notification Center looks it up by this identifier.
- Use it, not `===`, to check whether two requests are the same notification: requests read back from the system are new objects.

## Examples

```js
const content = new UNMutableNotificationContent();
const request = UNNotificationRequest.requestWithIdentifier('order-1024', { content });
console.log(request.identifier);
```

**Result**: Prints `order-1024`. A value passed in that isn't a string is converted to a string; for example, the number `1024` becomes `'1024'`.

## Corresponding iOS API

`UNNotificationRequest.identifier`.

## See also

- [`removePendingNotificationRequestsWithIdentifiers()`](../un-user-notification-center/removependingnotificationrequestswithidentifiers.md): cancel by identifier
- This class belongs to the `@nacrejs/user-notifications` package; see [Installation](../un-user-notification-center.md#installation)
