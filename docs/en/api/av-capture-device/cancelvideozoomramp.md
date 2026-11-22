---
type: reference
native: "-[AVCaptureDevice cancelVideoZoomRamp]"
---

# `AVCaptureDevice`: `cancelVideoZoomRamp()` method

The **`cancelVideoZoomRamp()`** method stops a smooth zoom started by [`rampToVideoZoomFactor()`](ramptovideozoomfactor.md), leaving the picture at the factor reached at that moment.

## Syntax

```
cancelVideoZoomRamp()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None. Calling it without [`lockForConfiguration()`](lockforconfiguration.md) doesn't throw either (verified by testing).

## Description

- Which factor the picture stops at, and what [`videoZoomFactor`](videozoomfactor.md) reads afterwards, is **not verified on a device**.
- Calling it when no zoom is in progress doesn't throw (verified by testing).

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.rampToVideoZoomFactor(Math.min(8, device.maxAvailableVideoZoomFactor), { withRate: 1 });
  } finally {
    device.unlockForConfiguration();
  }
  // Stop after one second
  setTimeout(() => {
    device.lockForConfiguration();
    try {
      device.cancelVideoZoomRamp();
    } finally {
      device.unlockForConfiguration();
    }
  }, 1000);
}
```

**Effect**: the picture zooms in slowly and stops after one second, at about 2×. **Not verified on a device.**

## Corresponding iOS API

`-[AVCaptureDevice cancelVideoZoomRamp]`.

## See also

- [`rampToVideoZoomFactor()`](ramptovideozoomfactor.md): start a smooth zoom
