---
type: reference
native: "-[AVCaptureVideoPreviewLayer pointForCaptureDevicePointOfInterest:]"
---

# `AVCaptureVideoPreviewLayer`: `pointForCaptureDevicePointOfInterest()` method

The **`pointForCaptureDevicePointOfInterest()`** method converts a 0-to-1 fractional coordinate in the picture into a point in this layer. It's the reverse of [`captureDevicePointOfInterestForPoint()`](capturedevicepointofinterestforpoint.md).

## Syntax

```
pointForCaptureDevicePointOfInterest(point)
```

### Parameters

**`point`**

A point in the picture, as fractions from 0 to 1; see [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture). For example, the camera's current [`focusPointOfInterest`](../av-capture-device/focuspointofinterest.md). It can be a [`CGPoint`](../cg-point.md) or a plain object with the two numbers `x` and `y`.

### Return value

A [`CGPoint`](../cg-point.md): a point in this layer, in pt, with the origin at the layer's top-left corner.

Verified by testing: while the session is capturing and the picture fills a 180 × 240 pt layer, `(0.5, 0.5)` converts back to `(90, 120)`, off by less than 1 pt.

The result depends on the session's current picture; compute it after the session has started capturing. Values computed before capturing starts are **not verified on a device**.

### Exceptions

**`TypeError`**

- `point` isn't an object: `pointForCaptureDevicePointOfInterest needs an object with all of: x, y`.
- A field is missing or isn't a finite number: `pointForCaptureDevicePointOfInterest is missing …, or it is not a finite number`.

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
    const point = preview.pointForCaptureDevicePointOfInterest({ x: 0.5, y: 0.5 });
    console.log(Math.round(point.x), Math.round(point.y));
  });
}
```

**Effect**: When access is granted, after the session starts capturing, the console prints `90 120`: the center of the picture is at the center of the layer.

## Corresponding iOS API

`-[AVCaptureVideoPreviewLayer pointForCaptureDevicePointOfInterest:]`.

## See also

- [`captureDevicePointOfInterestForPoint()`](capturedevicepointofinterestforpoint.md): convert from the layer to the picture
- [`focusPointOfInterest`](../av-capture-device/focuspointofinterest.md)
