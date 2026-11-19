---
type: reference
native: UNNotificationContent.sound
---

# `UNNotificationContent`: `sound` property

The **`sound`** property is the sound played when the notification is delivered. This is a value read from a request or notification.

## Value

A [`UNNotificationSound`](../un-notification-sound.md), or `null`.

- Read-only; assigning to it throws `TypeError`: `sound is read-only`.
- `null` if it was never set: no sound.
- Usually `UNNotificationSound.defaultSound` or `null`.
- Read from a remote push notification, it may be a `UNNotificationSound` that isn't equal to `UNNotificationSound.defaultSound`: this means the server specified a different sound file, whose file name can't be read. Content carrying it can't be used to create a request again; `requestWithIdentifier()` throws `TypeError` (**not verified in the simulator**).
- The content is a copy as of the moment the request was created and doesn't change afterward; there is no change notification.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Order shipped';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.sound));
```

**Result**: Prints `null`. This item was never set, so the default value is read.

## Corresponding iOS API

`UNNotificationContent.sound`.

## See also

- [`UNMutableNotificationContent`](../un-mutable-notification-content/sound.md): write this item
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Installation](../un-user-notification-center.md#installation)
