---
type: reference
native: AVCaptureSession.outputs
---

# `AVCaptureSession`: `outputs` property

The **`outputs`** property is all of the session's current outputs.

## Value

An array of [`AVCaptureOutput`](../av-capture-output.md). The elements are in practice [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md).

- Read-only. Assigning to it throws `TypeError`.
- An empty array for a new session.
- Outputs added with [`addOutput()`](addoutput.md) read back as the same objects (verified by testing).
- Each read gives a new array. Changing the array doesn't affect the session; add and remove outputs with `addOutput()` and [`removeOutput()`](removeoutput.md).
- It changes only when the app itself adds or removes outputs, so there is no change event.

## Examples

```js
const session = new AVCaptureSession();
const output = new AVCaptureMetadataOutput();
session.addOutput(output);
console.log(session.outputs.length, session.outputs[0] === output);
```

**Result**: prints `1 true`.

## Corresponding iOS API

`AVCaptureSession.outputs`.

## See also

- [`inputs`](inputs.md): all inputs
- [`addOutput()`](addoutput.md), [`removeOutput()`](removeoutput.md)
