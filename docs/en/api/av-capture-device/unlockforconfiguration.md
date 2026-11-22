---
type: reference
native: "-[AVCaptureDevice unlockForConfiguration]"
---

# `AVCaptureDevice`: `unlockForConfiguration()` method

The **`unlockForConfiguration()`** method gives back the right to change settings obtained with [`lockForConfiguration()`](lockforconfiguration.md).

## Syntax

```
unlockForConfiguration()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- After giving it back, the settings already written stay as they are: a torch that's on stays on, and the zoom factor doesn't change.
- Writing the torch, zoom, or focus properties after giving it back throws `TypeError` (verified by testing). To change them again, call `lockForConfiguration()` again.
- What happens when it's called without holding the lock is **not verified on a device**.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.autoFocusRangeRestriction = 'near';
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.autoFocusRangeRestriction);
}
```

**Effect**: prints `near`. The setting stays after the lock is given back.

## Corresponding iOS API

`-[AVCaptureDevice unlockForConfiguration]`.

## See also

- [`lockForConfiguration()`](lockforconfiguration.md): obtain the right to change settings
- [Lock before changing settings](../av-capture-device.md#lock-before-changing-settings)
