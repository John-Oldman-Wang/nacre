---
type: reference
native: AVCaptureDevice.position
---

# `AVCaptureDevice`: `position` property

The **`position`** property indicates which side of the device this camera is on.

## Value

A string, one of these three:

| Value | Meaning |
| --- | --- |
| `'back'` | A camera on the back |
| `'front'` | A camera on the screen side |
| `'unspecified'` | Not on a particular side, such as an external camera |

- Read-only. Assigning to it throws `TypeError`.
- This value never changes for a given camera, so there is no change event.
- The camera returned by [`defaultDeviceWithMediaType('video')`](defaultdevicewithmediatype.md) is `'back'` (verified by testing).

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.position === 'back') {
  console.log('This is the rear camera');
}
```

**Effect**: prints `This is the rear camera` on an iPhone.

## Corresponding iOS API

`AVCaptureDevice.position`. `AVCaptureDevicePositionBack` is written as `'back'`, and so on.

## See also

- [`defaultDeviceWithDeviceType()`](defaultdevicewithdevicetype.md): find a camera by side
