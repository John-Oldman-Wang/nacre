---
type: reference
native: UNNotificationContent.subtitle
---

# `UNNotificationContent`: `subtitle` property

The **`subtitle`** property is the notification's subtitle, the line under the title. This is a value read from a request or notification.

## Value

A string.

- Read-only; assigning to it throws `TypeError`: `subtitle is read-only`.
- `''` if it was never set.
- The content is a copy as of the moment the request was created and doesn't change afterward; there is no change notification.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Order shipped';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.subtitle));
```

**Result**: Prints `""`. This item was never set, so the default value is read.

## Corresponding iOS API

`UNNotificationContent.subtitle`.

## See also

- [`UNMutableNotificationContent`](../un-mutable-notification-content/subtitle.md): write this item
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
