---
type: reference
native: UNMutableNotificationContent.body
---

# `UNMutableNotificationContent`: `body` property

The **`body`** property is the body of the notification.

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
content.body = 'Expected to arrive tomorrow';
console.log(content.body);
```

**Result**: Prints `Expected to arrive tomorrow`. The notification shows this body text below the title (**not verified in the simulator**).

## Corresponding iOS API

`UNMutableNotificationContent.body`.

## See also

- [`UNNotificationContent`](../un-notification-content.md): the read-only property of the same name on content that is read back
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md): creating a request from content
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
