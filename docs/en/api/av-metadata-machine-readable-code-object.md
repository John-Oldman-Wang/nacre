---
type: reference
native: AVMetadataMachineReadableCodeObject
status: partial
---

# `AVMetadataMachineReadableCodeObject`

**`AVMetadataMachineReadableCodeObject`** represents a code recognized in the captured picture, such as a QR code or a product barcode. Besides the inherited type and position, it carries the code's text ([`stringValue`](av-metadata-machine-readable-code-object/stringvalue.md)) and the code's four corners ([`corners`](av-metadata-machine-readable-code-object/corners.md)).

It comes from the [`detect`](av-capture-metadata-output/detect-event.md) event of [`AVCaptureMetadataOutput`](av-capture-metadata-output.md). The element type of the event's `objects` is the parent class `AVMetadataObject`, so check with `instanceof AVMetadataMachineReadableCodeObject` before reading the code's fields.

Like its parent class, it's a read-only value. Assigning to a field throws `TypeError` with a message such as `stringValue is read-only` (verified by testing).

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: [`AVMetadataObject`](av-metadata-object.md) → `AVMetadataMachineReadableCodeObject`

## Constructor

Can't be created with `new`; it throws `TypeError` with the message `Illegal constructor: AVMetadataObject comes from the detect event of AVCaptureMetadataOutput` (verified by testing).

## Instance properties

Also inherits [`type`](av-metadata-object/type.md) and [`bounds`](av-metadata-object/bounds.md) from [`AVMetadataObject`](av-metadata-object.md).

| Property | Description |
| --- | --- |
| [`stringValue`](av-metadata-machine-readable-code-object/stringvalue.md) <small>read-only</small> | The code's text. `null` when the content isn't text |
| [`corners`](av-metadata-machine-readable-code-object/corners.md) <small>read-only</small> | The code's four corners, as an array of `CGPoint` |

## Instance methods

None.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    if (found instanceof AVMetadataMachineReadableCodeObject && found.stringValue !== null) {
      console.log(found.type + ' ' + found.stringValue + ', ' + found.corners.length + ' corners');
    }
  }
});
```

**Effect**: When scanning a QR code, it prints a line every frame, for example `qrCode https://example.com/a, 4 corners`. Verified by testing: a recognized QR code has `type` `'qrCode'` and 4 points in `corners`.

## Corresponding iOS API

`AVMetadataMachineReadableCodeObject`. `stringValue` is the same; `corners` is an array of dictionaries in ObjC and an array of [`CGPoint`](cg-point.md) here.

## See also

- [`AVMetadataObject`](av-metadata-object.md): the parent class, `type` and `bounds`
- [`detect`](av-capture-metadata-output/detect-event.md)
- [Draw a box around each code](../guides/scanning.md#draw-a-box-around-each-code)
