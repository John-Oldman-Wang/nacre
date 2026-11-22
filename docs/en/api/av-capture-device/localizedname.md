---
type: reference
native: AVCaptureDevice.localizedName
---

# `AVCaptureDevice`: `localizedName` property

The **`localizedName`** property is this camera's name for people, for showing in the interface, for example when letting the user pick a camera.

## Value

A string, not empty (verified by testing).

- Read-only. Assigning to it throws `TypeError`.
- Given by the system, in the system language. Measured as `Back Camera` for the rear camera of an iPhone 14. How it reads in other languages is **not verified on a device**.
- The name changes with the language, so don't use it to tell cameras apart. Use [`position`](position.md) to tell them apart and [`uniqueID`](uniqueid.md) to remember one.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
console.log(device === null ? 'No camera' : device.localizedName);
```

**Effect**: prints `Back Camera` on an iPhone 14.

## Corresponding iOS API

`AVCaptureDevice.localizedName`.

## See also

- [`uniqueID`](uniqueid.md): an identifier that doesn't change with the language
