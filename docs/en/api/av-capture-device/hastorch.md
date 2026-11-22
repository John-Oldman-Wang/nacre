---
type: reference
native: AVCaptureDevice.hasTorch
---

# `AVCaptureDevice`: `hasTorch` property

The **`hasTorch`** property indicates whether this camera has a torch. The torch is the steady fill light next to the camera.

## Value

A boolean.

- `true`: it has a torch, which can be turned on with [`torchMode`](torchmode.md). The rear camera of an iPhone 14 is `true` (verified by testing).
- `false`: no torch. Writing `torchMode` as `'on'` is then refused by the system and throws `TypeError` (**not verified on a device**).
- Read-only. Assigning to it throws `TypeError`.
- This value never changes for a given camera, so there is no change event.

Having a torch doesn't mean it can be turned on right now; check [`isTorchAvailable`](istorchavailable.md) as well.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
console.log(device !== null && device.hasTorch ? 'Show the torch button' : 'Hide the torch button');
```

**Effect**: prints `Show the torch button` on an iPhone 14.

## Corresponding iOS API

`AVCaptureDevice.hasTorch`.

## See also

- [`torchMode`](torchmode.md): turn the torch on and off
- [`isTorchAvailable`](istorchavailable.md): whether it can be turned on now
- [Turn on the flashlight](../../guides/scanning.md#turn-on-the-flashlight)
