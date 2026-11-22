---
type: reference
native: "-[AVCaptureDevice lockForConfiguration:]"
---

# `AVCaptureDevice`: `lockForConfiguration()` method

The **`lockForConfiguration()`** method obtains the right to change this camera's settings. Only after obtaining it can the torch, zoom, and focus properties be written.

## Syntax

```
lockForConfiguration()
```

### Parameters

None.

### Return value

None (`undefined`). If it returns, the lock was obtained.

### Exceptions

**[`NSError`](../ns-error.md)**

The system refuses: `lockForConfiguration failed: …`, followed by the reason the system gave. The `name` is `'NSError'`, and `domain` and `code` are the system's original values. This happens in situations such as the camera being held by another app. When exactly it can't be obtained is **not verified on a device**.

## Description

- Once obtained, these properties can be written: [`torchMode`](torchmode.md), [`videoZoomFactor`](videozoomfactor.md), [`focusMode`](focusmode.md), [`focusPointOfInterest`](focuspointofinterest.md), [`autoFocusRangeRestriction`](autofocusrangerestriction.md). Writing them without the lock throws a `DOMException` whose `name` is `'InvalidStateError'` (verified by testing).
- When done, call [`unlockForConfiguration()`](unlockforconfiguration.md) to give it back. Writing again after giving it back throws the same `DOMException` again (verified by testing).
- Give it back as soon as you're done: put the property writes in `try` and give the lock back in `finally`, so it's never forgotten even if something throws midway.
- It can be called without asking for camera permission first (verified by testing).

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.videoZoomFactor = 1;
    device.focusMode = 'continuousAutoFocus';
  } finally {
    device.unlockForConfiguration();
  }
}
```

**Effect**: the zoom goes back to 1×, focusing is set to continuous autofocus, and then the right to change settings is given back.

## Corresponding iOS API

`-[AVCaptureDevice lockForConfiguration:]`. In ObjC it returns `NO` on failure and puts the error in an out-parameter; here it throws an `NSError` whose `domain` and `code` are the out-parameter error's original values, with its description in `message`.

## See also

- [`unlockForConfiguration()`](unlockforconfiguration.md): give it back
- [Lock before changing settings](../av-capture-device.md#lock-before-changing-settings)
