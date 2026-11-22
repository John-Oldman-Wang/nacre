---
type: reference
native: "-[AVCaptureDevice isFocusModeSupported:]"
---

# `AVCaptureDevice`: `isFocusModeSupported()` method

The **`isFocusModeSupported()`** method asks whether this camera supports a focus mode.

## Syntax

```
isFocusModeSupported(focusMode)
```

### Parameters

**`focusMode`**

The focus mode: one of `'locked'`, `'autoFocus'`, `'continuousAutoFocus'`. See [`focusMode`](focusmode.md) for what they mean.

### Return value

A boolean. `true` means it's supported and can be written to `focusMode`. On the rear camera of an iPhone 14, both `'continuousAutoFocus'` and `'locked'` are `true` (verified by testing).

No lock is needed; you can ask at any time.

### Exceptions

**`TypeError`**

`focusMode` isn't one of the three: `isFocusModeSupported has no value "auto"; expected one of: …`, followed by all values.

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  console.log(device.isFocusModeSupported('continuousAutoFocus'));
}
```

**Effect**: prints `true` on an iPhone 14.

## Corresponding iOS API

`-[AVCaptureDevice isFocusModeSupported:]`. `AVCaptureFocusModeLocked` is written as `'locked'`, and so on.

## See also

- [`focusMode`](focusmode.md): the focus mode
