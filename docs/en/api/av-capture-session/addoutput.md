---
type: reference
native: "-[AVCaptureSession addOutput:]"
---

# `AVCaptureSession`: `addOutput()` method

The **`addOutput()`** method adds an output to the session. An output processes the session's picture; in practice it's an [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md), which recognizes codes.

## Syntax

```
addOutput(output)
```

### Parameters

**`output`**

An [`AVCaptureOutput`](../av-capture-output.md).

### Return value

None (`undefined`).

After it's added, [`outputs`](outputs.md) contains it, and reading it back gives the same object. The session holds the outputs added to it; the app doesn't need to keep its own reference.

### Exceptions

**`TypeError`**

- `output` is not an `AVCaptureOutput` (for example `null`): `addOutput needs an AVCaptureOutput, got …`.
- It can't be added, that is, [`canAddOutput()`](canaddoutput.md) is `false`: `addOutput: this output cannot be added to the session (check canAddOutput() first)`. Adding the same output a second time is one such case. After the throw, `outputs` is unchanged (verified by testing).

## Description

A metadata output knows which types it can recognize only after it's in a session connected to a camera. So the order is: first [`addInput()`](addinput.md) to connect the camera, then `addOutput()`, and last write the output's [`metadataObjectTypes`](../av-capture-metadata-output/metadataobjecttypes.md).

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode'];
  console.log(session.outputs.length, output.metadataObjectTypes.join(','));
}
```

**Result**: when the user has already allowed the app to use the camera, prints `1 qrCode`.

## Corresponding iOS API

`-[AVCaptureSession addOutput:]`. In ObjC, the system raises an ObjC exception when the output can't be added; here it throws `TypeError`, which you can catch with `try`.

## See also

- [`canAddOutput()`](canaddoutput.md): ask first whether it can be added
- [`removeOutput()`](removeoutput.md): remove it
- [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md): recognizing codes
