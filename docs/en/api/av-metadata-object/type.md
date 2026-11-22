---
type: reference
native: AVMetadataObject.type
---

# `AVMetadataObject`: `type` property

The **`type`** property is what was recognized: which kind of code, or something like a face.

## Value

A string, one of the names in the table in [`metadataObjectTypes`](../av-capture-metadata-output/metadataobjecttypes.md#value), such as `'qrCode'`, `'ean13Code'`, or `'face'`.

- Read-only. Assigning to it throws `TypeError`: `type is read-only`.
- The value is fixed when the object is created and never changes, so there is no change notification.
- It's always one of the types written in the output's `metadataObjectTypes`.
- Scanning a QR code, testing gives `'qrCode'`.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  console.log(e.objects.map((found) => found.type).join(', '));
});
```

**Effect**: While the session is capturing and a QR code is in front of the camera, each frame prints a line `qrCode`. With two QR codes in the picture, it prints `qrCode, qrCode`.

## Corresponding iOS API

`AVMetadataObject.type`. `AVMetadataObjectTypeQRCode` is written as `'qrCode'`, and so on for the rest.

## See also

- [`bounds`](bounds.md): where the recognized thing is in the picture
- [`detect`](../av-capture-metadata-output/detect-event.md)
