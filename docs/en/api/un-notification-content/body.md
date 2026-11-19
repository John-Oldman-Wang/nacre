---
type: reference
native: UNNotificationContent.body
---

# `UNNotificationContent`: `body` property

The **`body`** property is the body of the notification. This is a value read from a request or notification.

## Value

A string.

- Read-only; assigning to it throws `TypeError`: `body is read-only`.
- `''` if it was never set.
- The content is a copy as of the moment the request was created and doesn't change afterward; there is no change notification.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Order shipped';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.body));
```

**Result**: Prints `""`. This item was never set, so the default value is read.

## Corresponding iOS API

`UNNotificationContent.body`.

## See also

- [`UNMutableNotificationContent`](../un-mutable-notification-content/body.md): write this item
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
