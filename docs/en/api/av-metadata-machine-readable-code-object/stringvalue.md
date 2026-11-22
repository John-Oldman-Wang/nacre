---
type: reference
native: AVMetadataMachineReadableCodeObject.stringValue
---

# `AVMetadataMachineReadableCodeObject`: `stringValue` property

The **`stringValue`** property is the text in the code.

## Value

A string or `null`.

- When the code stores text, this is that text. For example, a QR code storing the URL `https://example.com/a` reads as that string (verified by testing).
- When the code doesn't store text (arbitrary bytes), it's `null`.
- Read-only. Assigning to it throws `TypeError`: `stringValue is read-only` (verified by testing).
- The value is fixed when the object is created and never changes.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  const first = e.objects[0];
  if (first instanceof AVMetadataMachineReadableCodeObject && first.stringValue !== null) {
    console.log('Scanned ' + first.stringValue);
  }
}, { once: true });
```

**Effect**: While the session is capturing and a QR code is in front of the camera, it prints `Scanned ` followed by the text in the code once, and nothing after that.

## Corresponding iOS API

`AVMetadataMachineReadableCodeObject.stringValue`.

## See also

- [`corners`](corners.md): the four corners of the code
- [`detect`](../av-capture-metadata-output/detect-event.md)
