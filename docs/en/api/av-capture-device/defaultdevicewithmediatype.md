---
type: reference
native: "+[AVCaptureDevice defaultDeviceWithMediaType:]"
---

# `AVCaptureDevice.defaultDeviceWithMediaType()` static method

The **`AVCaptureDevice.defaultDeviceWithMediaType()`** static method returns this device's default camera.

## Syntax

```
AVCaptureDevice.defaultDeviceWithMediaType(mediaType)
```

### Parameters

**`mediaType`**

The media type. Only `'video'` (the camera) is accepted.

### Return value

An `AVCaptureDevice`, or `null` when there is no camera.

- On an iPhone it's the wide-angle camera on the back. Measured on an iPhone 14: [`localizedName`](localizedname.md) is `Back Camera` and [`position`](position.md) is `'back'`.
- Every call returns the same object (verified by testing).
- You don't need to ask for permission first. Getting the camera object doesn't show an alert.

### Exceptions

**`TypeError`**

`mediaType` isn't `'video'`: `defaultDeviceWithMediaType has no value "audio"; expected one of: video`.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device === null) {
  console.log('This device has no camera');
} else {
  console.log(device.localizedName, device.position);
}
```

**Effect**: prints `Back Camera back` on an iPhone 14.

## Corresponding iOS API

`+[AVCaptureDevice defaultDeviceWithMediaType:]`. `AVMediaTypeVideo` is written as `'video'`.

## See also

- [`defaultDeviceWithDeviceType()`](defaultdevicewithdevicetype.md): find a camera by type and side, such as the front camera
- [`AVCaptureDeviceInput()`](../av-capture-device-input/constructor.md): connect a camera to a session
