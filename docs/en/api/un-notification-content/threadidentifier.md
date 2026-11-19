---
type: reference
native: UNNotificationContent.threadIdentifier
---

# `UNNotificationContent`: `threadIdentifier` property

The **`threadIdentifier`** property is the thread identifier for grouping. Notification Center stacks notifications with the same value into one group. This is a value read from a request or notification.

## Value

A string.

- Read-only; assigning to it throws `TypeError`: `threadIdentifier is read-only`.
- `''` if it was never set: not specified, grouped by app.
- The content is a copy as of the moment the request was created and doesn't change afterward; there is no change notification.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Order shipped';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.threadIdentifier));
```

**Result**: Prints `""`. This item was never set, so the default value is read.

## Corresponding iOS API

`UNNotificationContent.threadIdentifier`.

## See also

- [`UNMutableNotificationContent`](../un-mutable-notification-content/threadidentifier.md): write this item
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
