---
type: reference
native: UNNotificationSound.defaultSound
---

# `UNNotificationSound.defaultSound` static property

The **`UNNotificationSound.defaultSound`** static property is the system's default notification sound.

## Value

A `UNNotificationSound`.

- Read-only; assigning to it throws `TypeError`: `defaultSound is read-only`.
- Every read returns the same object, so it can be compared with `===`.
- It is the only sound that can be written to the content's [`sound`](../un-mutable-notification-content/sound.md).

## Examples

```js
const content = new UNMutableNotificationContent();
content.sound = UNNotificationSound.defaultSound;
console.log(content.sound === UNNotificationSound.defaultSound);
```

**Result**: Prints `true`. A notification sent with this content plays the system's default notification sound when delivered (**not verified in the simulator**).

## Corresponding iOS API

`UNNotificationSound.defaultSound`.

## See also

- [`sound`](../un-mutable-notification-content/sound.md)
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
