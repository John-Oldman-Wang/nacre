---
type: reference
native: AVCaptureOutput
status: partial
---

# `AVCaptureOutput`

**`AVCaptureOutput`** represents an output of an [`AVCaptureSession`](av-capture-session.md): the session hands the picture to it for processing. It is the common base class of outputs; apps use its subclass [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) to recognize codes and faces in the picture.

It is the parameter type of the session's [`addOutput()`](av-capture-session/addoutput.md), [`canAddOutput()`](av-capture-session/canaddoutput.md), and [`removeOutput()`](av-capture-session/removeoutput.md), and the element type of [`outputs`](av-capture-session/outputs.md).

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → `AVCaptureOutput`

## Constructor

Can't be created with `new`: `new AVCaptureOutput()` throws `TypeError` with the message `Illegal constructor: AVCaptureOutput cannot be constructed` (verified by testing). To recognize codes, use [`new AVCaptureMetadataOutput()`](av-capture-metadata-output/constructor.md).

## Instance properties

It has no properties of its own. Also inherits properties from `NSObject`.

## Instance methods

It has no methods of its own.

## Examples

```js
const session = new AVCaptureSession();
session.addOutput(new AVCaptureMetadataOutput());
for (const output of session.outputs) {
  if (output instanceof AVCaptureMetadataOutput) {
    console.log('Types to recognize: ' + output.metadataObjectTypes.length);
  }
}
```

**Result**: The console prints `Types to recognize: 0`. A new metadata output recognizes nothing.

The element type of `outputs` is `AVCaptureOutput`. To read the metadata output's properties, check with `instanceof AVCaptureMetadataOutput` first.

## Corresponding iOS API

`AVCaptureOutput`. `[session.outputs firstObject]` is written `session.outputs[0]`.

## See also

- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md): recognizing codes and faces
- [`AVCaptureSession`](av-capture-session.md): adding and removing outputs
