---
type: reference
native: UNNotificationContent.title
---

# `UNNotificationContent`: `title` property

The **`title`** property is the notification's title, the bold line. This is a value read from a request or notification.

## Value

A string.

- Read-only; assigning to it throws `TypeError`: `title is read-only`.
- `''` if it was never set.
- The content is a copy as of the moment the request was created and doesn't change afterward; there is no change notification.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Order shipped';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.title));
```

**Result**: Prints `"Order shipped"`.

## Corresponding iOS API

`UNNotificationContent.title`.

## See also

- [`UNMutableNotificationContent`](../un-mutable-notification-content/title.md): write this item
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
