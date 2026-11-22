---
type: reference
native: "-[AVCaptureSession beginConfiguration]"
---

# `AVCaptureSession`: `beginConfiguration()` method

The **`beginConfiguration()`** method starts a group of changes. Changes to the session between it and [`commitConfiguration()`](commitconfiguration.md) (adding or removing inputs and outputs, changing the quality preset) take effect at once when `commitConfiguration()` is called.

While the session is capturing, a group of changes takes effect at once, so the picture doesn't stop in a half-changed state. When the session isn't capturing, you don't need it.

## Syntax

```
beginConfiguration()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

Switching from the back camera to the front camera while capturing:

```js
/**
 * @param {AVCaptureSession} session a session that is capturing
 * @param {AVCaptureDeviceInput} current the input connected now
 */
function switchToFront(session, current) {
  const front = AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera',
                                                            { position: 'front' });
  if (front === null) return current;
  const next = new AVCaptureDeviceInput(front);
  session.beginConfiguration();
  session.removeInput(current);
  if (session.canAddInput(next)) {
    session.addInput(next);
  } else {
    session.addInput(current);
  }
  session.commitConfiguration();
  return session.inputs[0] === next ? next : current;
}
```

**Effect**: the picture in the preview layer switches to the front camera's. If the new input can't be added, the original camera is connected again. **Not verified on a device.**

## Corresponding iOS API

`-[AVCaptureSession beginConfiguration]`.

## See also

- [`commitConfiguration()`](commitconfiguration.md): apply the changes
