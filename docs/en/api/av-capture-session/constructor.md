---
type: reference
native: "-[AVCaptureSession init]"
---

# `AVCaptureSession()` constructor

The **`AVCaptureSession()`** constructor creates a capture session. A session connects inputs (cameras) to outputs (the metadata output that recognizes codes, and the preview layer that shows the picture).

## Syntax

```
new AVCaptureSession()
```

### Parameters

None.

### Return value

A new `AVCaptureSession`. Each `new` gives a new object. A new session has:

- [`inputs`](inputs.md) and [`outputs`](outputs.md) as empty arrays.
- [`sessionPreset`](sessionpreset.md) set to `'high'`.
- [`isRunning`](isrunning.md) and [`isInterrupted`](isinterrupted.md) set to `false`.

Creating a session needs no camera authorization and shows no alert.

### Exceptions

**`TypeError`**

- Subclassing it: `class Mine extends AVCaptureSession {}` throws at `new Mine()`, with the message `Illegal constructor: Mine extends AVCaptureSession, but subclassing native classes is not supported yet`.

## Examples

```js
const session = new AVCaptureSession();
console.log(session.sessionPreset, session.inputs.length, session.isRunning);
```

**Result**: prints `high 0 false`.

## Corresponding iOS API

`[[AVCaptureSession alloc] init]`.

## See also

- [`addInput()`](addinput.md): connect a camera
- [`addOutput()`](addoutput.md): add an output that recognizes codes
- [`startRunning()`](startrunning.md): start capturing
- [Installing `@nacrejs/av-capture`](../av-capture-session.md#installation)
