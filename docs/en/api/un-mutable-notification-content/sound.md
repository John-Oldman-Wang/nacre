---
type: reference
native: UNMutableNotificationContent.sound
---

# `UNMutableNotificationContent`: `sound` property

The **`sound`** property is the sound played when the notification is delivered.

## Value

A [`UNNotificationSound`](../un-notification-sound.md), or `null`.

- Readable and writable.
- The default is `null`: silent.
- Only `UNNotificationSound.defaultSound` (the system's default notification sound) or `null` (silent) can be written.
- When the app is in the foreground, whether a delivered notification plays a sound also depends on whether [`foregroundPresentationOptions`](../un-user-notification-center/foregroundpresentationoptions.md) includes `'sound'`.
- The content is copied when a request is created. Changing this property after the request is created does not change requests already created.
- Only the app itself can change it; there is no change notification.

### Invalid values

- Writing `null` or `undefined` gives `null`.
- Other values throw `TypeError`: `sound must be UNNotificationSound.defaultSound or null, got "default"`.
- Writing the kind of sound read from a remotely pushed notification also throws: `sound must be UNNotificationSound.defaultSound or null, got a sound that came from a delivered notification`.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'New message';
content.sound = UNNotificationSound.defaultSound;
console.log(content.sound === UNNotificationSound.defaultSound);
```

**Result**: Prints `true`. A notification sent with this content plays the system's default notification sound when delivered (**not verified in the simulator**).

## Corresponding iOS API

`UNMutableNotificationContent.sound`.

## See also

- [`UNNotificationContent`](../un-notification-content.md): the read-only property of the same name on content that is read back
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md): creating a request from content
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
