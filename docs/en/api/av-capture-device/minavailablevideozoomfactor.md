---
type: reference
native: AVCaptureDevice.minAvailableVideoZoomFactor
---

# `AVCaptureDevice`: `minAvailableVideoZoomFactor` property

The **`minAvailableVideoZoomFactor`** property is the smallest value [`videoZoomFactor`](videozoomfactor.md) can be written right now.

## Value

A number, in multiples (×).

- Read-only. Assigning to it throws `TypeError`.
- Measured as `1` on the rear camera of an iPhone 14.
- The system provides it, and there is no change event. Read it when you need it. When it changes is **not verified on a device**.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  console.log(device.minAvailableVideoZoomFactor + ' to ' + device.maxAvailableVideoZoomFactor);
}
```

**Effect**: prints `1 to 123.75` on an iPhone 14.

## Corresponding iOS API

`AVCaptureDevice.minAvailableVideoZoomFactor`.

## See also

- [`maxAvailableVideoZoomFactor`](maxavailablevideozoomfactor.md): the largest value
- [`videoZoomFactor`](videozoomfactor.md): the zoom factor
