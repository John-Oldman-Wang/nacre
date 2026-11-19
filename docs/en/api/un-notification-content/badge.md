---
type: reference
native: UNNotificationContent.badge
---

# `UNNotificationContent`: `badge` property

The **`badge`** property is what the number in the top-right corner of the app icon (the badge) is changed to when the notification is delivered. This is a value read from a request or notification.

## Value

An integer (a count), or `null`.

- Read-only; assigning to it throws `TypeError`: `badge is read-only`.
- `null` if it was never set.
- `0`: removes the number from the icon on delivery.
- `null`: doesn't change the number on the icon on delivery.
- The content is a copy as of the moment the request was created and doesn't change afterward; there is no change notification.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Order shipped';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.badge));
```

**Result**: Prints `null`. This item was never set, so the default value is read.

## Corresponding iOS API

`UNNotificationContent.badge`.

## See also

- [`UNMutableNotificationContent`](../un-mutable-notification-content/badge.md): write this item
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
