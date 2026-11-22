---
type: reference
native: AVCaptureDevice.maxAvailableVideoZoomFactor
---

# `AVCaptureDevice`: `maxAvailableVideoZoomFactor` property

The **`maxAvailableVideoZoomFactor`** property is the largest value [`videoZoomFactor`](videozoomfactor.md) can be written right now.

## Value

A number, in multiples (×).

- Read-only. Assigning to it throws `TypeError` (verified by testing).
- Measured as `123.75` on the rear camera of an iPhone 14. It differs between cameras and models.
- The system provides it, and there is no change event. Read it when you need it. When it changes is **not verified on a device**.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  // Scanning doesn't need a large factor; pick your own upper limit
  const limit = Math.min(4, device.maxAvailableVideoZoomFactor);
  console.log('Zoom up to ' + limit + 'x');
}
```

**Effect**: prints `Zoom up to 4x` on an iPhone 14.

## Corresponding iOS API

`AVCaptureDevice.maxAvailableVideoZoomFactor`.

## See also

- [`minAvailableVideoZoomFactor`](minavailablevideozoomfactor.md): the smallest value
- [`videoZoomFactor`](videozoomfactor.md): the zoom factor
