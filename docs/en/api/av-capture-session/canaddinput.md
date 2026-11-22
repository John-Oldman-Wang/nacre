---
type: reference
native: "-[AVCaptureSession canAddInput:]"
---

# `AVCaptureSession`: `canAddInput()` method

The **`canAddInput()`** method asks whether an input can be added to this session right now. It only asks; it doesn't add.

## Syntax

```
canAddInput(input)
```

### Parameters

**`input`**

An [`AVCaptureInput`](../av-capture-input.md). In practice it's an [`AVCaptureDeviceInput`](../av-capture-device-input.md).

### Return value

A boolean. `true` means [`addInput()`](addinput.md) can add it; `false` means it can't, for example because the input is already in the session (verified by testing: after an input has been added once, asking again gives `false`).

### Exceptions

**`TypeError`**

- `input` is not an `AVCaptureInput`: `canAddInput needs an AVCaptureInput, got …`.

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  const input = new AVCaptureDeviceInput(camera);
  console.log(session.canAddInput(input));
  session.addInput(input);
  console.log(session.canAddInput(input));
}
```

**Result**: when the user has already allowed the app to use the camera, prints `true`, then `false`. If the user hasn't been asked yet, the `new AVCaptureDeviceInput()` line first shows the authorization alert; see [Authorization](../av-capture-device.md#authorization).

## Corresponding iOS API

`-[AVCaptureSession canAddInput:]`.

## See also

- [`addInput()`](addinput.md): add it
- [`inputs`](inputs.md): the current inputs
