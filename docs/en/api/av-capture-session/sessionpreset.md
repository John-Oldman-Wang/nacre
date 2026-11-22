---
type: reference
native: AVCaptureSession.sessionPreset
---

# `AVCaptureSession`: `sessionPreset` property

The **`sessionPreset`** property is the session's quality preset. It determines how large the picture from the camera is.

## Value

A string, one of these twelve:

| Value | Meaning |
| --- | --- |
| `'high'` | High quality. The default |
| `'medium'` | Medium quality |
| `'low'` | Low quality |
| `'photo'` | A high-resolution picture suited to photos |
| `'352x288'` | A picture 352 pixels wide and 288 high |
| `'640x480'` | A picture 640 pixels wide and 480 high |
| `'1280x720'` | A picture 1280 pixels wide and 720 high |
| `'1920x1080'` | A picture 1920 pixels wide and 1080 high |
| `'3840x2160'` | A picture 3840 pixels wide and 2160 high |
| `'iFrame960x540'` | iFrame format, 960 pixels wide and 540 high. iFrame is a video format that's easy to edit |
| `'iFrame1280x720'` | iFrame format, 1280 pixels wide and 720 high |
| `'inputPriority'` | The session doesn't set the quality; the camera's current format decides it |

- Readable and writable.
- The default is `'high'` (verified by testing).
- Whether a preset can be used depends on the camera and outputs connected to the session. Ask with [`canSetSessionPreset()`](cansetsessionpreset.md) before writing.
- It changes only when the app itself writes it, so there is no change event.
- What each preset looks like in the preview layer is **not verified on a device**.

### Invalid values

- Writing a name that isn't in the table: no exception; the console prints a warning listing all valid values, and `sessionPreset` keeps its previous value (verified by testing).
- Writing a preset that's in the table but can't be used right now (`canSetSessionPreset()` is `false`): throws `TypeError` with the message `sessionPreset "…" is not supported by this session's current inputs and outputs`, and the value is unchanged.

## Examples

```js
const session = new AVCaptureSession();
if (session.canSetSessionPreset('medium')) {
  session.sessionPreset = 'medium';
}
console.log(session.sessionPreset);
```

**Result**: prints `medium` (verified by testing).

## Corresponding iOS API

`AVCaptureSession.sessionPreset`. `AVCaptureSessionPresetHigh` is written `'high'`, `AVCaptureSessionPreset1920x1080` is written `'1920x1080'`, `AVCaptureSessionPresetiFrame960x540` is written `'iFrame960x540'`, and so on.

## See also

- [`canSetSessionPreset()`](cansetsessionpreset.md): ask whether a preset can be used
- [Enums](../enums.md): why an invalid property value is a warning rather than an exception
