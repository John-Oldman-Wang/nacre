---
type: reference
native: UNMutableNotificationContent.title
---

# `UNMutableNotificationContent`: `title` property

The **`title`** property is the title of the notification, a bold line.

## Value

A string.

- Readable and writable.
- The default is `''`.
- The content is copied when a request is created. Changing this property after the request is created does not change requests already created.
- Only the app itself can change it; there is no change notification.

### Invalid values

- Converted to a string: writing the number `5` gives `'5'`.
- Writing `null` or `undefined` gives an empty string.
- Does not throw.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Your order has shipped';
console.log(content.title);
```

**Result**: Prints `Your order has shipped`. A notification sent with this content has "Your order has shipped" as the bold line on its banner (**not verified in the simulator**).

## Corresponding iOS API

`UNMutableNotificationContent.title`.

## See also

- [`UNNotificationContent`](../un-notification-content.md): the read-only property of the same name on content that is read back
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md): creating a request from content
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
