---
type: reference
native: AVCaptureSession.inputs
---

# `AVCaptureSession`: `inputs` property

The **`inputs`** property is all of the session's current inputs.

## Value

An array of [`AVCaptureInput`](../av-capture-input.md). The elements are in practice [`AVCaptureDeviceInput`](../av-capture-device-input.md).

- Read-only. Assigning to it throws `TypeError`.
- An empty array for a new session.
- Inputs added with [`addInput()`](addinput.md) read back as the same objects (verified by testing).
- Each read gives a new array. Changing the array doesn't affect the session; add and remove inputs with `addInput()` and [`removeInput()`](removeinput.md).
- It changes only when the app itself adds or removes inputs, so there is no change event.

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  const input = new AVCaptureDeviceInput(camera);
  session.addInput(input);
  for (const item of session.inputs) {
    if (item instanceof AVCaptureDeviceInput) console.log(item.device.localizedName);
  }
}
```

**Effect**: when the user has already allowed the app to use the camera, prints the camera's name, for example `Back Camera`.

## Corresponding iOS API

`AVCaptureSession.inputs`.

## See also

- [`outputs`](outputs.md): all outputs
- [`addInput()`](addinput.md), [`removeInput()`](removeinput.md)
