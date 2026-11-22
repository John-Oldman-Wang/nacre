---
type: reference
native: "-[AVCaptureSession removeInput:]"
---

# `AVCaptureSession`: `removeInput()` method

The **`removeInput()`** method removes an input from the session.

## Syntax

```
removeInput(input)
```

### Parameters

**`input`**

An [`AVCaptureInput`](../av-capture-input.md), usually one added earlier with [`addInput()`](addinput.md). What happens when you pass an input that isn't in this session is **not verified on a device**.

### Return value

None (`undefined`). After removal, [`inputs`](inputs.md) no longer contains it (verified by testing).

### Exceptions

**`TypeError`**

- `input` is not an `AVCaptureInput`: `removeInput needs an AVCaptureInput, got …`.

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  const input = new AVCaptureDeviceInput(camera);
  session.addInput(input);
  session.removeInput(input);
  console.log(session.inputs.length);
}
```

**Result**: when the user has already allowed the app to use the camera, prints `0`.

## Corresponding iOS API

`-[AVCaptureSession removeInput:]`.

## See also

- [`addInput()`](addinput.md): add it
- [`beginConfiguration()`](beginconfiguration.md): combine a removal and an addition into one change
