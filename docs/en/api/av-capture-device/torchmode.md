---
type: reference
native: AVCaptureDevice.torchMode
---

# `AVCaptureDevice`: `torchMode` property

The **`torchMode`** property controls the torch next to the camera: off, on, or switched automatically by ambient light.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'off'` | Off |
| `'on'` | Stays on |
| `'auto'` | Turns on automatically when it's dark and off when it's bright |

- Readable and writable.
- Defaults to `'off'` (verified by testing).
- Call [`lockForConfiguration()`](lockforconfiguration.md) before writing it, and [`unlockForConfiguration()`](unlockforconfiguration.md) afterwards.
- That the torch actually lights up after writing `'on'` or `'auto'` is **not verified on a device**.
- The app writes it itself, and there is no event when it changes.

### Invalid values

- Writing without the lock: throws `TypeError`, and the value doesn't change (verified by testing). The message is `torchMode: the system refused (…)`; the parentheses hold the reason the system gave, which says to lock first (`-lockForConfiguration:`).
- The camera has no torch ([`hasTorch`](hastorch.md) is `false`) or doesn't support this value: the system refuses, and it throws `TypeError` with the reason the system gave. **Not verified on a device.**
- Writing a value not in the table doesn't throw: a warning listing all valid values is printed to the console, and `torchMode` keeps its previous value (verified by testing).

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.hasTorch) {
  device.lockForConfiguration();
  try {
    device.torchMode = device.torchMode === 'on' ? 'off' : 'on';
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.torchMode);
}
```

**Effect**: turns the torch on if it's off and off if it's on, and prints the new value. The torch actually lighting up and going out is **not verified on a device**.

## Corresponding iOS API

`AVCaptureDevice.torchMode`. `AVCaptureTorchModeOn` is written as `'on'`, and so on. In ObjC, writing without the lock throws `NSGenericException`; here it's `TypeError`.

## See also

- [`hasTorch`](hastorch.md), [`isTorchAvailable`](istorchavailable.md): whether there is one, and whether it can be used now
- [Lock before changing settings](../av-capture-device.md#lock-before-changing-settings)
- [Turn on the flashlight](../../guides/scanning.md#turn-on-the-flashlight)
