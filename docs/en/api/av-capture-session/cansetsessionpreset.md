---
type: reference
native: "-[AVCaptureSession canSetSessionPreset:]"
---

# `AVCaptureSession`: `canSetSessionPreset()` method

The **`canSetSessionPreset()`** method asks whether a quality preset can be set on this session right now. The answer depends on the camera and outputs connected to the session.

## Syntax

```
canSetSessionPreset(preset)
```

### Parameters

**`preset`**

The preset's name, one of the twelve in the [`sessionPreset`](sessionpreset.md) table.

### Return value

A boolean. `true` means writing this preset to `sessionPreset` won't throw. A new session answers `true` for `'high'` (verified by testing).

### Exceptions

**`TypeError`**

- `preset` isn't a name in the table: `canSetSessionPreset has no value "hd"; expected one of: …`, followed by all preset names.

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
  console.log(session.canSetSessionPreset('3840x2160'));
}
```

**Effect**: when the user has already allowed the app to use the camera, prints whether this phone's back camera can deliver a 3840 × 2160 pixel picture. The answer on each model is **not verified on a device**.

## Corresponding iOS API

`-[AVCaptureSession canSetSessionPreset:]`. `AVCaptureSessionPreset3840x2160` is written `'3840x2160'`, and so on.

## See also

- [`sessionPreset`](sessionpreset.md): all presets
