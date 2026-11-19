---
type: reference
native: UNMutableNotificationContent.userInfo
---

# `UNMutableNotificationContent`: `userInfo` property

The **`userInfo`** property is data that travels with the notification and is not visible to the user. After the notification is tapped, it comes back unchanged in the [`notificationclick`](../un-user-notification-center/notificationclick-event.md) event.

## Value

An object.

- Readable and writable.
- The default is `{}`.
- What is written is a copy; changing the original object afterward does not affect the content.
- The object read back is frozen; changing it throws `TypeError`.
- Values can only be strings, finite numbers, booleans, arrays, and plain objects, and can be nested.
- The content is copied when a request is created. Changing this property after the request is created does not change requests already created.
- Only the app itself can change it; there is no change notification.

### Invalid values

- Writing `null` or `undefined` is the same as writing `{}`.
- Keys whose value is `undefined` are skipped.
- A value that is not a plain object throws `TypeError`: `userInfo must be a plain object, got "A1024"`.
- `null`, a `Date`, or a function inside it throws `TypeError`, and the message says which one: `userInfo.a.b must be a string, number, boolean, array or plain object, got null`.
- `NaN` or `Infinity` inside it throws `TypeError`: `userInfo.a must be a finite number, got NaN`.
- An object that references an object containing it (a cycle) throws `TypeError`.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Your order has shipped';
content.userInfo = { screen: 'order', orderId: 'A1024' };
console.log(Object.isFrozen(content.userInfo), content.userInfo.orderId);
```

**Result**: Prints `true A1024`. When the user taps this notification, `response.notification.request.content.userInfo.orderId` in the `notificationclick` event is `'A1024'` (**not verified in the simulator**).

## Corresponding iOS API

`UNMutableNotificationContent.userInfo`.

## See also

- [`UNNotificationContent`](../un-notification-content.md): the read-only property of the same name on content that is read back
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md): creating a request from content
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
