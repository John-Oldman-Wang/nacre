---
type: reference
native: UNNotificationContent.userInfo
---

# `UNNotificationContent`: `userInfo` property

The **`userInfo`** property is data that travels with the notification, not visible to the user. After the notification is tapped, you get it back unchanged from the [`notificationclick`](../un-user-notification-center/notificationclick-event.md) event. This is a value read from a request or notification.

## Value

An object.

- Read-only; assigning to it throws `TypeError`: `userInfo is read-only`.
- `{}` if it was never set.
- The object you read is frozen; changing it throws `TypeError`.
- For remote push notifications, this is the whole push payload, that is, the JSON object the server sent, which can contain `null`.
- The content is a copy as of the moment the request was created and doesn't change afterward; there is no change notification.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Order shipped';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.userInfo));
```

**Result**: Prints `{}`. This item was never set, so the default value is read.

## Corresponding iOS API

`UNNotificationContent.userInfo`.

## See also

- [`UNMutableNotificationContent`](../un-mutable-notification-content/userinfo.md): write this item
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
