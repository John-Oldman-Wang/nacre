---
type: reference
native: "-[AVCaptureDevice rampToVideoZoomFactor:withRate:]"
---

# `AVCaptureDevice`: `rampToVideoZoomFactor()` method

The **`rampToVideoZoomFactor()`** method zooms the picture smoothly to a given factor at a given speed, instead of jumping there at once.

## Syntax

```
rampToVideoZoomFactor(factor, { withRate })
```

### Parameters

**`factor`**

The target factor, a number. Converted with `Number()`. Should be between [`minAvailableVideoZoomFactor`](minavailablevideozoomfactor.md) and [`maxAvailableVideoZoomFactor`](maxavailablevideozoomfactor.md).

**`options.withRate`**

The speed, a number, required. Each second the picture zooms by a factor of 2 to the power of `withRate`: `1` doubles the zoom each second, `2` quadruples it. Converted with `Number()`.

### Return value

None (`undefined`). The method returns right away, and the zoom happens over the following moments. That the zoom is visible in the picture is **not verified on a device**. There is no event when the zoom finishes.

### Exceptions

**`TypeError`**

- `withRate` is missing: `rampToVideoZoomFactor needs options.withRate` (verified by testing).
- `factor` can't be converted to a finite number: `rampToVideoZoomFactor must be a finite number, got …`.
- `withRate` can't be converted to a finite number: `withRate must be a finite number, got …`.
- The system refuses the factor: the message includes the reason the system gave. Which values are refused is **not verified on a device**.

## Description

- Calling it without [`lockForConfiguration()`](lockforconfiguration.md) doesn't throw either (verified by testing). It's still best to call it while holding the lock, together with other settings.
- To stop midway, call [`cancelVideoZoomRamp()`](cancelvideozoomramp.md).

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.rampToVideoZoomFactor(Math.min(2, device.maxAvailableVideoZoomFactor), { withRate: 4 });
  } finally {
    device.unlockForConfiguration();
  }
}
```

**Effect**: the picture zooms smoothly to 2× in a short time. **Not verified on a device.**

## Corresponding iOS API

`-[AVCaptureDevice rampToVideoZoomFactor:withRate:]`. The second part goes in an options object: `{ withRate }`.

## See also

- [`videoZoomFactor`](videozoomfactor.md): set the factor directly
- [`cancelVideoZoomRamp()`](cancelvideozoomramp.md): stop
- [Zoom in](../../guides/scanning.md#zoom-in)
