---
type: reference
native: "-[AVCaptureSession canAddOutput:]"
---

# `AVCaptureSession`: `canAddOutput()` method

The **`canAddOutput()`** method asks whether an output can be added to this session right now. It only asks; it doesn't add.

## Syntax

```
canAddOutput(output)
```

### Parameters

**`output`**

An [`AVCaptureOutput`](../av-capture-output.md). In practice it's an [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md).

### Return value

A boolean. `true` means [`addOutput()`](addoutput.md) can add it; `false` means it can't, for example because the output is already in the session (verified by testing: after an output has been added once, asking again gives `false`).

A metadata output can be added even when the session has no input yet (verified by testing: `true`).

### Exceptions

**`TypeError`**

- `output` is not an `AVCaptureOutput`: `canAddOutput needs an AVCaptureOutput, got …`.

## Examples

```js
const session = new AVCaptureSession();
const output = new AVCaptureMetadataOutput();
console.log(session.canAddOutput(output));
session.addOutput(output);
console.log(session.canAddOutput(output));
```

**Result**: prints `true`, then `false`. No camera authorization is needed.

## Corresponding iOS API

`-[AVCaptureSession canAddOutput:]`.

## See also

- [`addOutput()`](addoutput.md): add it
- [`outputs`](outputs.md): the current outputs
