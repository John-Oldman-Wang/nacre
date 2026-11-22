---
type: reference
native: AVCaptureMetadataOutput.availableMetadataObjectTypes
---

# `AVCaptureMetadataOutput`: `availableMetadataObjectTypes` property

The **`availableMetadataObjectTypes`** property lists the types this output can recognize right now. [`metadataObjectTypes`](metadataobjecttypes.md) can only be chosen from these.

## Value

An array of type names; each name is one from the table in [`metadataObjectTypes`](metadataobjecttypes.md#value).

- Read-only. Assigning to it throws `TypeError`.
- Each read returns a new array; changing that array doesn't affect the output.
- **Before the output is added to a session that has a camera connected, it's an empty array** (verified by testing).
- After it's added, the content depends on the connected camera. On the back camera of an iPhone 14 it was measured to include `'qrCode'`, `'ean13Code'`, `'ean8Code'`, `'code128Code'`, `'code39Code'`, `'code39Mod43Code'`, `'code93Code'`, `'pdf417Code'`, `'aztecCode'`, `'dataMatrixCode'`, `'interleaved2of5Code'`, `'itf14Code'`, `'upceCode'`, `'codabarCode'`, `'face'`, and more.
- It changes with the session's inputs and outputs, and no event fires when it changes. Read it when you need it: once after [`addOutput()`](../av-capture-session/addoutput.md) and before writing `metadataObjectTypes`.

## Examples

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  console.log(output.availableMetadataObjectTypes.length);
  session.addOutput(output);
  console.log(output.availableMetadataObjectTypes.includes('qrCode'));
}
```

**Effect**: When access is granted, the console prints `0` and then `true`.

## Corresponding iOS API

`AVCaptureMetadataOutput.availableMetadataObjectTypes`. The constant `AVMetadataObjectTypeQRCode` is written as `'qrCode'`, and so on for the rest.

## See also

- [`metadataObjectTypes`](metadataobjecttypes.md): choose the types to recognize
- [`addOutput()`](../av-capture-session/addoutput.md)
