---
type: reference
native: AVCaptureDevice.uniqueID
---

# `AVCaptureDevice`: `uniqueID` property

The **`uniqueID`** property is this camera's unique identifier.

## Value

A string, not empty (verified by testing).

- Read-only. Assigning to it throws `TypeError`.
- On the same device, the same camera keeps the same identifier after the app restarts. This is **not verified on a device**.
- Use it to remember which camera the user chose last time. Don't use it as a name to show people; that's [`localizedName`](localizedname.md).

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  application.storage.set('camera', device.uniqueID);
}
```

**Effect**: stores the default camera's identifier in local storage, so it can be read back and compared on the next launch.

## Corresponding iOS API

`AVCaptureDevice.uniqueID`.

## See also

- [`localizedName`](localizedname.md): the name shown to people
