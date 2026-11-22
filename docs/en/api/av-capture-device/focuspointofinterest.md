---
type: reference
native: AVCaptureDevice.focusPointOfInterest
---

# `AVCaptureDevice`: `focusPointOfInterest` property

The **`focusPointOfInterest`** property is the focus point: the spot in the picture the camera focuses on.

## Value

Reads as a [`CGPoint`](../cg-point.md). When writing, you can pass a `CGPoint` or `{ x, y }`.

- Readable and writable.
- The coordinates are fractions from 0 to 1, not points (pt): (0, 0) is the top-left corner of the picture and (1, 1) the bottom-right. The picture's orientation is the one you get when the phone is turned 90 degrees counterclockwise into landscape (with its original bottom edge on your right), which differs from what the screen shows when the phone is held upright. See [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture).
- Don't convert by hand. When the user taps a spot on the camera preview, convert the point in the layer to this fraction with the preview layer's [`captureDevicePointOfInterestForPoint()`](../av-capture-video-preview-layer/capturedevicepointofinterestforpoint.md).
- Defaults to (0.5, 0.5), the center of the picture (verified by testing).
- Call [`lockForConfiguration()`](lockforconfiguration.md) before writing it, and [`unlockForConfiguration()`](unlockforconfiguration.md) afterwards. The camera must support a focus point; see [`isFocusPointOfInterestSupported`](isfocuspointofinterestsupported.md).
- After writing, it reads back as the written value (verified by testing).
- After writing it, write [`focusMode`](focusmode.md) once more for the camera to focus on the new point. The focusing effect is **not verified on a device**.
- The app writes it itself, and there is no event when it changes.

### Invalid values

- Writing without the lock: throws `TypeError`, and the value doesn't change (verified by testing). The message is `focusPointOfInterest: the system refused (…)`; the parentheses hold the reason the system gave, which says to lock first (`-lockForConfiguration:`).
- Writing something that isn't an object: throws `TypeError`: `focusPointOfInterest needs an object with all of: x, y` (verified by testing).
- The camera doesn't support a focus point: the system refuses, and it throws `TypeError` with the reason the system gave. **Not verified on a device.**

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.isFocusPointOfInterestSupported) {
  device.lockForConfiguration();
  try {
    device.focusPointOfInterest = { x: 0.25, y: 0.75 };
    device.focusMode = 'autoFocus';
  } finally {
    device.unlockForConfiguration();
  }
  const p = device.focusPointOfInterest;
  console.log(p.x, p.y);
}
```

**Effect**: prints `0.25 0.75`. The camera focuses once on that spot; the effect in the picture is **not verified on a device**.

## Corresponding iOS API

`AVCaptureDevice.focusPointOfInterest`. In ObjC, writing without the lock throws `NSGenericException`; here it's `TypeError`.

## See also

- [`captureDevicePointOfInterestForPoint()`](../av-capture-video-preview-layer/capturedevicepointofinterestforpoint.md): convert from a point in the layer
- [`focusMode`](focusmode.md): write it again after setting the focus point
- [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture)
