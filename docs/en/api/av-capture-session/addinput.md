---
type: reference
native: "-[AVCaptureSession addInput:]"
---

# `AVCaptureSession`: `addInput()` method

The **`addInput()`** method adds an input to the session. An input is where the picture comes from; in practice it's an [`AVCaptureDeviceInput`](../av-capture-device-input.md) connected to a camera.

## Syntax

```
addInput(input)
```

### Parameters

**`input`**

An [`AVCaptureInput`](../av-capture-input.md).

### Return value

None (`undefined`).

After it's added, [`inputs`](inputs.md) contains it, and reading it back gives the same object. The session holds the inputs added to it; the app doesn't need to keep its own reference.

### Exceptions

**`TypeError`**

- `input` is not an `AVCaptureInput` (for example an output, `null`, or a string): `addInput needs an AVCaptureInput, got …`.
- It can't be added, that is, [`canAddInput()`](canaddinput.md) is `false`: `addInput: this input cannot be added to the session (check canAddInput() first)`. Adding the same input a second time is one such case. After the throw, `inputs` is unchanged.

## Description

- Connect the camera first, then add the [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md): which types a metadata output can recognize is known only after it's in a session connected to a camera.
- To change inputs while the session is capturing, put the removal and the addition between [`beginConfiguration()`](beginconfiguration.md) and [`commitConfiguration()`](commitconfiguration.md), so both take effect at once.

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  const input = new AVCaptureDeviceInput(camera);
  if (session.canAddInput(input)) {
    session.addInput(input);
  }
  console.log(session.inputs.length, session.inputs[0] === input);
}
```

**Result**: when the user has already allowed the app to use the camera, prints `1 true`.

## Corresponding iOS API

`-[AVCaptureSession addInput:]`. In ObjC, the system raises an ObjC exception when the input can't be added; here it throws `TypeError`, which you can catch with `try`.

## See also

- [`canAddInput()`](canaddinput.md): ask first whether it can be added
- [`removeInput()`](removeinput.md): remove it
- [`AVCaptureDeviceInput()`](../av-capture-device-input/constructor.md): create an input connected to a camera
