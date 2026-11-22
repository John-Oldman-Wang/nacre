---
type: reference
native: AVCaptureSessionInterruptEvent.reason
---

# `AVCaptureSessionInterruptEvent`: `reason` property

The **`reason`** property is why the capture session was interrupted.

## Value

A string or `null`. It is `null` when the system gives no reason. The string is one of:

- Read-only. Assigning to it throws `TypeError`.
- `'videoDeviceNotAvailableInBackground'`: the app went to the background.
- `'audioDeviceInUseByAnotherClient'`: another app is using the microphone.
- `'videoDeviceInUseByAnotherClient'`: another app is using the camera.
- `'videoDeviceNotAvailableWithMultipleForegroundApps'`: more than one app is in the foreground.
- `'videoDeviceNotAvailableDueToSystemPressure'`: the system took the camera back for reasons such as the device being too hot.
- `'sensitiveContentMitigationActivated'`: the system's sensitive content protection kicked in.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('interrupt', (e) => {
  if (e.reason === 'videoDeviceInUseByAnotherClient') {
    console.log('摄像头被别的 App 占着');
  }
});
```

**Effect**: when another app takes the camera and the session is interrupted, prints `摄像头被别的 App 占着`. **Not verified on a device.**

## Corresponding iOS API

`userInfo[AVCaptureSessionInterruptionReasonKey]` of `AVCaptureSessionWasInterruptedNotification`.

## See also

- [`AVCaptureSessionInterruptEvent`](../av-capture-session-interrupt-event.md)
