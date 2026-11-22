---
type: reference
native: AVCaptureDevice
status: partial
---

# `AVCaptureDevice`

**`AVCaptureDevice`** represents a camera on the phone. Through it, the app asks whether the user has authorized camera use, finds a particular camera, and changes that camera's settings: the flashlight, zoom, and focus.

To get the camera's picture, create an [`AVCaptureDeviceInput`](av-capture-device-input.md) from it and add that to an [`AVCaptureSession`](av-capture-session.md).

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → `AVCaptureDevice`

## Constructor

Can't be created with `new`: `new AVCaptureDevice()` throws `TypeError` with the message `Illegal constructor: AVCaptureDevice is created by the runtime, not by new`. Cameras come from the two static methods below. Getting the default camera again returns the same object (verified by testing).

## Static methods

[`AVCaptureDevice.authorizationStatusForMediaType()`](av-capture-device/authorizationstatusformediatype.md)

The user's decision on whether this app may use the camera. Reading it doesn't show an alert.

[`AVCaptureDevice.requestAccessForMediaType()`](av-capture-device/requestaccessformediatype.md)

Asks the user for camera access; fulfills with whether it was granted.

[`AVCaptureDevice.defaultDeviceWithMediaType()`](av-capture-device/defaultdevicewithmediatype.md)

This device's default camera, which is the back one.

[`AVCaptureDevice.defaultDeviceWithDeviceType()`](av-capture-device/defaultdevicewithdevicetype.md)

Finds a camera by type and by which side of the phone it's on, for example the front wide-angle camera.

## Instance properties

Also inherits properties from `NSObject`.

Which camera it is:

| Property | Description |
| --- | --- |
| [`uniqueID`](av-capture-device/uniqueid.md) <small>read-only</small> | A unique identifier for this camera |
| [`localizedName`](av-capture-device/localizedname.md) <small>read-only</small> | A name for people to read |
| [`position`](av-capture-device/position.md) <small>read-only</small> | Which side of the phone it's on: `'back'`, `'front'` |

Flashlight:

| Property | Description |
| --- | --- |
| [`hasTorch`](av-capture-device/hastorch.md) <small>read-only</small> | Whether it has a flashlight |
| [`isTorchAvailable`](av-capture-device/istorchavailable.md) <small>read-only</small> | Whether the flashlight can be used right now |
| [`torchMode`](av-capture-device/torchmode.md) | The flashlight: off, on, or auto. Lock before writing |

Zoom:

| Property | Description |
| --- | --- |
| [`videoZoomFactor`](av-capture-device/videozoomfactor.md) | The zoom factor; 1 is no zoom. Lock before writing |
| [`minAvailableVideoZoomFactor`](av-capture-device/minavailablevideozoomfactor.md) <small>read-only</small> | The smallest zoom factor available right now |
| [`maxAvailableVideoZoomFactor`](av-capture-device/maxavailablevideozoomfactor.md) <small>read-only</small> | The largest zoom factor available right now |

Focus:

| Property | Description |
| --- | --- |
| [`focusMode`](av-capture-device/focusmode.md) | How it focuses. Lock before writing |
| [`isFocusPointOfInterestSupported`](av-capture-device/isfocuspointofinterestsupported.md) <small>read-only</small> | Whether it supports setting a focus point |
| [`focusPointOfInterest`](av-capture-device/focuspointofinterest.md) | The focus point, as a ratio from 0 to 1. Lock before writing |
| [`autoFocusRangeRestriction`](av-capture-device/autofocusrangerestriction.md) | Which distance range autofocus searches. Lock before writing |

None of these properties has a change event.

## Instance methods

| Method | Description |
| --- | --- |
| [`lockForConfiguration()`](av-capture-device/lockforconfiguration.md) | Gets the right to change settings. Throws [`NSError`](ns-error.md) if it can't |
| [`unlockForConfiguration()`](av-capture-device/unlockforconfiguration.md) | Gives back the right to change settings |
| [`rampToVideoZoomFactor()`](av-capture-device/ramptovideozoomfactor.md) | Zooms smoothly to a factor |
| [`cancelVideoZoomRamp()`](av-capture-device/cancelvideozoomramp.md) | Stops a smooth zoom in progress |
| [`isFocusModeSupported()`](av-capture-device/isfocusmodesupported.md) | Whether a focus mode is supported |

## Events

It has no events of its own.

## Authorization

The user has to agree before the app can use the camera. The user's decision is read from [`authorizationStatusForMediaType('video')`](av-capture-device/authorizationstatusformediatype.md) and is one of these four:

| Value | Meaning | Can the camera be used? |
| --- | --- | --- |
| `'notDetermined'` | The user hasn't been asked yet | No; request it first |
| `'authorized'` | The user agreed | Yes |
| `'denied'` | The user declined | No |
| `'restricted'` | A restriction on the device (parental controls and the like) doesn't allow it, and the user can't change it | No |

- Request with [`requestAccessForMediaType('video')`](av-capture-device/requestaccessformediatype.md). If the user hasn't been asked yet, the system shows an alert showing the [`NSCameraUsageDescription`](av-capture-session.md#installation) written in `nacre.config.json`. After the user agrees, the status is `'authorized'` (verified by testing).
- Each app is asked only once. Requesting again after that shows no alert and fulfills immediately with the previous result (verified by testing). After the user declines, only the user can change it, in the system Settings.
- Calling [`new AVCaptureDeviceInput(device)`](av-capture-device-input/constructor.md) before the user has been asked also shows the alert at that moment (verified by testing). Calling `requestAccessForMediaType()` first is recommended: that way you know the result before connecting the camera, and can show a different screen when the user declines.
- Without authorization, `new AVCaptureDeviceInput(device)` throws [`NSError`](ns-error.md) (verified by testing).
- The media type can only be `'video'`. For anything else, `authorizationStatusForMediaType()` throws `TypeError` and `requestAccessForMediaType()` rejects with `TypeError` (verified by testing).
- There is no event when authorization changes. After the user changes it in Settings, read it again the next time you need it.

## Lock before changing settings

Before writing [`torchMode`](av-capture-device/torchmode.md), [`videoZoomFactor`](av-capture-device/videozoomfactor.md), [`focusMode`](av-capture-device/focusmode.md), [`focusPointOfInterest`](av-capture-device/focuspointofinterest.md), or [`autoFocusRangeRestriction`](av-capture-device/autofocusrangerestriction.md), call [`lockForConfiguration()`](av-capture-device/lockforconfiguration.md) to get the right to change settings, and call [`unlockForConfiguration()`](av-capture-device/unlockforconfiguration.md) to give it back when done.

- Writing without the lock throws a [`DOMException`](dom-exception.md) whose `name` is `'InvalidStateError'`, and leaves the value unchanged (verified by testing). The message is `<property name>: the system refused (…)`, with the reason the system gave in the parentheses. For example, writing `videoZoomFactor` without the lock puts `*** -[AVCaptureDevice setVideoZoomFactor:] May not be called without first successfully gaining exclusive ownership of the device using -lockForConfiguration:` in the parentheses (verified by testing).
- Writing again after giving the lock back throws again (verified by testing).
- When the right can't be obtained (for example, another app is using the camera), `lockForConfiguration()` throws an [`NSError`](ns-error.md) whose `domain` and `code` are the system's original values. This case is **not verified on a device**.
- [`rampToVideoZoomFactor()`](av-capture-device/ramptovideozoomfactor.md) and [`cancelVideoZoomRamp()`](av-capture-device/cancelvideozoomramp.md) don't throw when called without the lock (verified by testing).
- Reading these properties doesn't need the lock.

The recommended pattern is lock, change, and give it back in `finally`, so that the lock isn't held forever if a change throws:

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  camera.lockForConfiguration();
  try {
    camera.videoZoomFactor = 2;
    camera.autoFocusRangeRestriction = 'near';
  } finally {
    camera.unlockForConfiguration();
  }
  console.log(camera.videoZoomFactor, camera.autoFocusRangeRestriction);
}
```

**Effect**: The console prints `2 near`. While the camera is running, the picture zooms to 2× (the change in the picture is **not verified on a device**).

## Examples

### Look at the default camera

This involves no UI, so the code runs as is at the top level of `main.js`.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/av-capture" />

const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera === null) {
  console.log('No camera');
} else {
  console.log(camera.localizedName, camera.position);
  console.log('Zoom ' + camera.minAvailableVideoZoomFactor + ' to ' + camera.maxAvailableVideoZoomFactor);
  console.log('Focus ' + camera.focusMode + ', flashlight ' + (camera.hasTorch ? 'yes' : 'no'));
}
```

**Result**: On an iPhone 14, it prints the three lines below (verified by testing). Reading these properties needs no authorization and shows no alert.

```
Back Camera back
Zoom 1 to 123.75
Focus continuousAutoFocus, flashlight yes
```

### Find the front camera

```js
const front = AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera', {
  mediaType: 'video',
  position: 'front',
});
console.log(front === null ? 'No front camera' : front.position);
```

**Result**: On an iPhone 14, it prints `front` (verified by testing).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo]` | `AVCaptureDevice.authorizationStatusForMediaType('video')` |
| `[AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:…]` | `await AVCaptureDevice.requestAccessForMediaType('video')` |
| `[AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo]` | `AVCaptureDevice.defaultDeviceWithMediaType('video')` |
| `[AVCaptureDevice defaultDeviceWithDeviceType:AVCaptureDeviceTypeBuiltInWideAngleCamera mediaType:AVMediaTypeVideo position:AVCaptureDevicePositionFront]` | `AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera', { mediaType: 'video', position: 'front' })` |
| `[device lockForConfiguration:&error]`, which returns `NO` on failure | `device.lockForConfiguration()`, which throws an `NSError` on failure, with `error`'s original `domain` and `code` |
| `device.torchMode = AVCaptureTorchModeOn` | `device.torchMode = 'on'` |
| `device.torchAvailable` | `device.isTorchAvailable` |
| `[device rampToVideoZoomFactor:2 withRate:4]` | `device.rampToVideoZoomFactor(2, { withRate: 4 })` |

## See also

- [Scanning codes](../guides/scanning.md): requesting authorization, turning on the flashlight, close-range focus, zooming in
- [`AVCaptureDeviceInput`](av-capture-device-input.md): connecting a camera to a session
- [`AVCaptureSession`](av-capture-session.md): capturing, and how to install this package
- [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md): converting a point in the layer to a focus point
