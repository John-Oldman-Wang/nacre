---
type: reference
native: UIScreen.referenceDisplayModeStatus
---

# `UIScreen`: `referenceDisplayModeStatus` property

The **`referenceDisplayModeStatus`** property is the status of this screen's reference display mode. Reference display mode shows color and brightness accurately to a standard, for professional uses such as color grading and reviewing footage.

## Value

A string, one of these four values:

| Value | Meaning |
| --- | --- |
| `'notSupported'` | This screen does not support reference display mode |
| `'notEnabled'` | Supported, but the user has not turned it on |
| `'limited'` | The user turned it on, but accurate display is not possible right now, for example because the device is overheating or the battery is low |
| `'enabled'` | Turned on and displaying accurately |

- Read-only. Assigning to it throws `TypeError`.
- On the iPhone Air simulator (iOS 27.2) it is `'notSupported'`.
- The [`referencedisplaymodestatuschange`](referencedisplaymodestatuschange-event.md) event fires when it changes.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.referenceDisplayModeStatus);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `notSupported`.

## Corresponding iOS API

`UIScreen.referenceDisplayModeStatus`. The values are the `UIScreenReferenceDisplayModeStatus` constants with the prefix removed and the first letter lowercased.

## See also

- [`referencedisplaymodestatuschange`](referencedisplaymodestatuschange-event.md)
