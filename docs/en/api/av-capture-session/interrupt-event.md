---
type: reference
native: AVCaptureSessionWasInterruptedNotification
---

# `AVCaptureSession`: `interrupt` event

The **`interrupt`** event fires when the system interrupts the session. While interrupted, the session temporarily stops capturing.

## Syntax

```
session.addEventListener('interrupt', (event) => { })
```

## Event object

`AVCaptureSessionInterruptEvent`, with one extra field:

**`reason`**

Why the session was interrupted: a string, one of these six; `null` when the system gives no reason:

| Value | Meaning |
| --- | --- |
| `'videoDeviceNotAvailableInBackground'` | The app went to the background |
| `'audioDeviceInUseByAnotherClient'` | Another app is using the microphone |
| `'videoDeviceInUseByAnotherClient'` | Another app is using the camera |
| `'videoDeviceNotAvailableWithMultipleForegroundApps'` | More than one app is in the foreground |
| `'videoDeviceNotAvailableDueToSystemPressure'` | The system took the camera back for a reason such as the device being too hot |
| `'sensitiveContentMitigationActivated'` | The system's sensitive content protection took effect |

`target` is the session. Not cancelable; `preventDefault()` has no effect.

## When it fires

- On the turn after the system interrupts the session. At that point [`isInterrupted`](isinterrupted.md) is `true`.
- When the interruption ends, [`interruptend`](interruptend-event.md) fires.

Whether this event actually fires, the situations in which each reason appears, and what the preview layer looks like while interrupted are all **not verified on a device**.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('interrupt', (e) => {
  if (e.reason === 'videoDeviceInUseByAnotherClient') {
    console.log('Another app is using the camera');
  } else {
    console.log('Interrupted', e.reason);
  }
});
```

**Effect** (**not verified on a device**): prints a line when the session is interrupted. When another app is using the camera, prints `Another app is using the camera`.

## Corresponding iOS API

The notification `AVCaptureSessionWasInterruptedNotification`. `userInfo[AVCaptureSessionInterruptionReasonKey]` is `e.reason`; `AVCaptureSessionInterruptionReasonVideoDeviceInUseByAnotherClient` is written `'videoDeviceInUseByAnotherClient'`, and so on.

## See also

- [`interruptend`](interruptend-event.md): the interruption ended
- [`isInterrupted`](isinterrupted.md)
- [When the session is interrupted](../../guides/scanning.md#when-the-session-is-interrupted)
