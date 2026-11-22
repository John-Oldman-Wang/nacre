---
type: reference
native: "+[AVCaptureDeviceInput deviceInputWithDevice:error:]"
---

# `AVCaptureDeviceInput()` constructor

The **`AVCaptureDeviceInput()`** constructor wraps a camera as an input for a session. After creating it, add it with the session's [`addInput()`](../av-capture-session/addinput.md); only then does the session take pictures from this camera.

## Syntax

```
new AVCaptureDeviceInput(device)
```

### Parameters

**`device`**

The camera to connect, an [`AVCaptureDevice`](../av-capture-device.md). Get it from `AVCaptureDevice.defaultDeviceWithMediaType('video')` or `AVCaptureDevice.defaultDeviceWithDeviceType()`.

### Return value

A new `AVCaptureDeviceInput`. Its [`device`](device.md) is the camera that was passed in.

### Exceptions

**`TypeError`**

- `device` is not an `AVCaptureDevice` (`null`, a string, another native object): `AVCaptureDeviceInput needs an AVCaptureDevice, got …`.
- Subclassing it: `class Mine extends AVCaptureDeviceInput {}` throws on `new Mine()`, with a message starting with `Illegal constructor`.

**`Error`**

The argument is valid, but the system can't open this camera: `cannot open this camera: …`, followed by the reason the system gives. Verified by testing: this is thrown when the user has denied camera access. Whether it's thrown when another app is using the camera is **not verified on a device**.

## Description

- When the user hasn't been asked yet (the authorization status is `'notDetermined'`), the system shows the authorization alert at the moment of `new AVCaptureDeviceInput(device)` (verified by testing). The recommended approach is to request access first with [`AVCaptureDevice.requestAccessForMediaType()`](../av-capture-device/requestaccessformediatype.md) and create the input once you have the answer; see [Authorization](../av-capture-device.md#authorization).
- Creating an input uses `NSCameraUsageDescription` from `nacre.config.json`; see [Installing `@nacrejs/av-capture`](../av-capture-session.md#installation).

## Examples

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const input = new AVCaptureDeviceInput(camera);
  const session = new AVCaptureSession();
  if (session.canAddInput(input)) session.addInput(input);
  console.log(session.inputs.length);
}
```

**Effect**: When access is already granted, the console prints `1`: the session is connected to the back camera. Without access, nothing is printed.

## Corresponding iOS API

`+[AVCaptureDeviceInput deviceInputWithDevice:error:]`. In ObjC it returns `nil` and fills in `error` on failure; here it throws `Error` instead.

## See also

- [`device`](device.md): which camera is connected
- [`addInput()`](../av-capture-session/addinput.md): add the input to a session
- [Ask for permission first](../../guides/scanning.md#ask-for-permission-first)
- [Installing `@nacrejs/av-capture`](../av-capture-session.md#installation)
