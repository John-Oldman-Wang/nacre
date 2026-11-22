---
type: reference
native: AVCaptureDeviceInput.device
---

# `AVCaptureDeviceInput`: `device` property

The **`device`** property is the camera this input is connected to.

## Value

An [`AVCaptureDevice`](../av-capture-device.md): the one passed in when the input was created, as the same object (verified by testing).

- Read-only. Assigning to it throws `TypeError` (verified by testing).
- It doesn't change after creation, so there is no change notification.

## Examples

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const input = new AVCaptureDeviceInput(camera);
  console.log(input.device === camera, input.device.position);
}
```

**Effect**: When access is granted, the console prints `true back`.

## Corresponding iOS API

`AVCaptureDeviceInput.device`.

## See also

- [`AVCaptureDeviceInput()`](constructor.md)
- [`AVCaptureDevice`](../av-capture-device.md): the flashlight, zoom, and focus are changed on the camera
