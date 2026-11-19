---
type: reference
native: UNMutableNotificationContent.badge
---

# `UNMutableNotificationContent`: `badge` property

The **`badge`** property is what to set the number at the top right of the app icon (the badge) to when the notification is delivered.

## Value

An integer (a count), or `null`.

- Readable and writable.
- The default is `null`.
- `0`: removes the number from the icon on delivery.
- `null`: leaves the number on the icon unchanged on delivery.
- The effect on delivery is **not verified in the simulator**.
- The content is copied when a request is created. Changing this property after the request is created does not change requests already created.
- Only the app itself can change it; there is no change notification.

### Invalid values

- Strings that look like numbers are converted to numbers, with fractions truncated toward zero: writing `'3'` gives `3`, and writing `2.9` gives `2`.
- Writing `null` or `undefined` gives `null`.
- A negative number throws `TypeError`: `badge must not be negative, got -1`.
- A value that cannot be converted to a number throws `TypeError`: `badge must be a finite number, got "many"`.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = '3 new messages';
content.badge = 3;
console.log(content.badge);
```

**Result**: Prints `3`. When a notification sent with this content is delivered, the top right of the app icon shows 3 (**not verified in the simulator**).

## Corresponding iOS API

`UNMutableNotificationContent.badge`.

## See also

- [`UNNotificationContent`](../un-notification-content.md): the read-only property of the same name on content that is read back
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md): creating a request from content
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
