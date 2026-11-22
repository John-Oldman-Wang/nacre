---
type: reference
native: AVCaptureDevice.focusPointOfInterestSupported
---

# `AVCaptureDevice`: `isFocusPointOfInterestSupported` property

The **`isFocusPointOfInterestSupported`** property indicates whether this camera supports setting a focus point, that is, whether [`focusPointOfInterest`](focuspointofinterest.md) can aim it at a particular spot in the picture.

## Value

A boolean.

- `true`: supported. The rear camera of an iPhone 14 is `true` (verified by testing).
- `false`: not supported. Writing `focusPointOfInterest` is then refused by the system and throws a `DOMException` whose `name` is `'InvalidStateError'` (**not verified on a device**).
- Read-only. Assigning to it throws `TypeError`.
- This value never changes for a given camera, so there is no change event.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.isFocusPointOfInterestSupported) {
  console.log('Tap to focus is possible');
}
```

**Effect**: prints `Tap to focus is possible` on an iPhone 14.

## Corresponding iOS API

`AVCaptureDevice.focusPointOfInterestSupported`; its ObjC getter is `isFocusPointOfInterestSupported`.

## See also

- [`focusPointOfInterest`](focuspointofinterest.md): the focus point
