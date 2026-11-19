---
type: reference
native: UNMutableNotificationContent.threadIdentifier
---

# `UNMutableNotificationContent`: `threadIdentifier` property

The **`threadIdentifier`** property is the group identifier. Notification Center stacks notifications with the same value into one group.

## Value

A string.

- Readable and writable.
- The default is `''`: not specified, grouped by app.
- How groups look on screen is **not verified in the simulator**.
- The content is copied when a request is created. Changing this property after the request is created does not change requests already created.
- Only the app itself can change it; there is no change notification.

### Invalid values

- Converted to a string: writing the number `5` gives `'5'`.
- Writing `null` or `undefined` gives an empty string.
- Does not throw.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Alex: What should we have for dinner?';
content.threadIdentifier = 'chat-alex';
```

**Effect**: Notifications from the same conversation stack into one group in Notification Center (**not verified in the simulator**).

## Corresponding iOS API

`UNMutableNotificationContent.threadIdentifier`.

## See also

- [`UNNotificationContent`](../un-notification-content.md): the read-only property of the same name on content that is read back
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md): creating a request from content
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
