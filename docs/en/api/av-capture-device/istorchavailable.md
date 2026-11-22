---
type: reference
native: AVCaptureDevice.torchAvailable
---

# `AVCaptureDevice`: `isTorchAvailable` property

The **`isTorchAvailable`** property indicates whether this camera's torch can be used right now.

## Value

A boolean.

- `true`: it can be used now.
- `false`: it can't be used now. A camera without a torch is always `false`; for one with a torch, the system temporarily disables it when the device gets too hot, and it's `false` then too. How this value changes as the device heats up is **not verified on a device**.
- Read-only. Assigning to it throws `TypeError`.
- The system changes it, and there is no event when it changes. Read it again right before turning on the torch.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.hasTorch && !device.isTorchAvailable) {
  console.log('The torch is temporarily unavailable');
}
```

**Effect**: prints a line only while the system has temporarily disabled the torch. Normally prints nothing.

## Corresponding iOS API

`AVCaptureDevice.torchAvailable`; its ObjC getter is `isTorchAvailable`.

## See also

- [`hasTorch`](hastorch.md): whether there is a torch
- [`torchMode`](torchmode.md): turn the torch on and off
