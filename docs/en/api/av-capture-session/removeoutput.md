---
type: reference
native: "-[AVCaptureSession removeOutput:]"
---

# `AVCaptureSession`: `removeOutput()` method

The **`removeOutput()`** method removes an output from the session.

## Syntax

```
removeOutput(output)
```

### Parameters

**`output`**

An [`AVCaptureOutput`](../av-capture-output.md), usually one added earlier with [`addOutput()`](addoutput.md). What happens when you pass an output that isn't in this session is **not verified on a device**.

### Return value

None (`undefined`). After removal, [`outputs`](outputs.md) no longer contains it (verified by testing).

### Exceptions

**`TypeError`**

- `output` is not an `AVCaptureOutput`: `removeOutput needs an AVCaptureOutput, got …`.

## Examples

```js
const session = new AVCaptureSession();
const output = new AVCaptureMetadataOutput();
session.addOutput(output);
session.removeOutput(output);
console.log(session.outputs.length);
```

**Result**: prints `0`.

## Corresponding iOS API

`-[AVCaptureSession removeOutput:]`.

## See also

- [`addOutput()`](addoutput.md): add it
