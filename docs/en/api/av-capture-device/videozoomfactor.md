---
type: reference
native: AVCaptureDevice.videoZoomFactor
---

# `AVCaptureDevice`: `videoZoomFactor` property

The **`videoZoomFactor`** property is the zoom factor of the picture. Writing it zooms the picture to that factor immediately.

## Value

A number, in multiples (×).

- Readable and writable.
- Defaults to `1`, meaning no zoom (verified by testing).
- The writable range is [`minAvailableVideoZoomFactor`](minavailablevideozoomfactor.md) to [`maxAvailableVideoZoomFactor`](maxavailablevideozoomfactor.md). Measured as 1 to 123.75 on the rear camera of an iPhone 14.
- Call [`lockForConfiguration()`](lockforconfiguration.md) before writing it, and [`unlockForConfiguration()`](unlockforconfiguration.md) afterwards.
- The written value is converted with `Number()`: `'1.5'` gives `1.5` (verified by testing).
- After writing, it reads back as the written value (verified by testing). How the zoomed picture looks is **not verified on a device**.
- The value read while [`rampToVideoZoomFactor()`](ramptovideozoomfactor.md) is zooming smoothly is **not verified on a device**.
- The app writes it itself, and there is no event when it changes.

### Invalid values

- Writing without the lock: throws `TypeError`, and the value doesn't change (verified by testing). The message is `videoZoomFactor: the system refused (…)`; the parentheses hold the reason the system gave, which says to lock first (`-lockForConfiguration:`).
- Outside the writable range: throws `TypeError` (verified by testing), with the reason the system gave in the message.
- Can't be converted to a finite number: throws `TypeError`, for example `videoZoomFactor must be a finite number, got "abc"`.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  const factor = Math.min(2, device.maxAvailableVideoZoomFactor);
  device.lockForConfiguration();
  try {
    device.videoZoomFactor = factor;
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.videoZoomFactor);
}
```

**Effect**: the picture zooms to 2×, and `2` is printed. The change in the picture is **not verified on a device**.

## Corresponding iOS API

`AVCaptureDevice.videoZoomFactor`. In ObjC, writing without the lock throws `NSGenericException`; here it's `TypeError`.

## See also

- [`rampToVideoZoomFactor()`](ramptovideozoomfactor.md): zoom smoothly
- [Lock before changing settings](../av-capture-device.md#lock-before-changing-settings)
- [Zoom in](../../guides/scanning.md#zoom-in)
