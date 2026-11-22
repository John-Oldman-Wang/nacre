---
type: reference
native: "-[AVCaptureVideoPreviewLayer captureDevicePointOfInterestForPoint:]"
---

# `AVCaptureVideoPreviewLayer`: `captureDevicePointOfInterestForPoint()` method

The **`captureDevicePointOfInterestForPoint()`** method converts a point in this layer into the fractions used by a camera's [`focusPointOfInterest`](../av-capture-device/focuspointofinterest.md). Use it to focus wherever the user taps.

## Syntax

```
captureDevicePointOfInterestForPoint(point)
```

### Parameters

**`point`**

A point in the layer, in pt, with the origin at the layer's top-left corner. It can be a [`CGPoint`](../cg-point.md) or a plain object with the two numbers `x` and `y`.

### Return value

A [`CGPoint`](../cg-point.md) (verified by testing) whose numbers are fractions from 0 to 1; see [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture).

Verified by testing: while the session is capturing and the picture fills a 180 × 240 pt layer, the center of the layer `(90, 120)` converts to `(0.5, 0.5)`.

The result depends on the session's current picture; compute it after the session has started capturing. Values computed before capturing starts are **not verified on a device**.

For the reverse conversion, use [`pointForCaptureDevicePointOfInterest()`](pointforcapturedevicepointofinterest.md).

### Exceptions

**`TypeError`**

- `point` isn't an object: `captureDevicePointOfInterestForPoint needs an object with all of: x, y` (verified by testing with a number).
- A field is missing or isn't a finite number: `captureDevicePointOfInterestForPoint is missing …, or it is not a finite number`.

## Examples

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const preview = new AVCaptureVideoPreviewLayer(session);
  preview.videoGravity = 'resizeAspectFill';
  preview.frame = new CGRect(0, 0, 180, 240);

  session.startRunning().then(() => {
    const point = preview.captureDevicePointOfInterestForPoint({ x: 90, y: 120 });
    console.log(point.x.toFixed(2), point.y.toFixed(2));
  });
}
```

**Effect**: When access is granted, after the session starts capturing, the console prints `0.50 0.50`.

## Corresponding iOS API

`-[AVCaptureVideoPreviewLayer captureDevicePointOfInterestForPoint:]`.

## See also

- [`focusPointOfInterest`](../av-capture-device/focuspointofinterest.md): set the converted point as the focus point
- [`pointForCaptureDevicePointOfInterest()`](pointforcapturedevicepointofinterest.md): the reverse conversion
