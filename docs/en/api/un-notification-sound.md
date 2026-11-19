---
type: reference
native: UNNotificationSound
status: partial
---

# `UNNotificationSound`

**`UNNotificationSound`** represents the sound played when a notification arrives. For now there is only the system default one: [`UNNotificationSound.defaultSound`](un-notification-sound/defaultsound.md). If you want no sound, leave the content's `sound` as `null`.

The `sound` read from a remotely pushed notification may be a different `UNNotificationSound`: it indicates that the server specified another sound file, and the file name cannot be read (**not verified in the simulator**).

It is a plain JS value and does not inherit from `NSObject`.

Install `@nacrejs/user-notifications` first; for how, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation), or [Core and capability packages](capabilities.md).

**Inheritance**: `UNNotificationSound`

## Constructor

It cannot be created with `new`. `new UNNotificationSound()` throws `TypeError`:

```
Illegal constructor: UNNotificationSound cannot be constructed; use UNNotificationSound.defaultSound
```

## Static properties

[`UNNotificationSound.defaultSound`](un-notification-sound/defaultsound.md) <small>read-only</small>

The system's default notification sound. Every read returns the same object.

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'New message';
content.sound = UNNotificationSound.defaultSound;
```

**Effect**: A notification sent with this content plays the system's default notification sound when delivered. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `UNNotificationSound.defaultSound` | `UNNotificationSound.defaultSound` |

## See also

- [`sound`](un-mutable-notification-content/sound.md): the sound goes in this property of the content
