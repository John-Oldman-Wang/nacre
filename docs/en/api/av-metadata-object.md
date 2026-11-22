---
type: reference
native: AVMetadataObject
status: partial
---

# `AVMetadataObject`

**`AVMetadataObject`** represents one thing that an [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) recognized in a frame: what it is ([`type`](av-metadata-object/type.md)) and where it is in the picture ([`bounds`](av-metadata-object/bounds.md)). When what's recognized is a code, you get its subclass [`AVMetadataMachineReadableCodeObject`](av-metadata-machine-readable-code-object.md), which adds the code's content and its four corners. Types such as faces and human bodies give you a plain `AVMetadataObject`.

It is a read-only value: its fields are fixed when it's recognized and don't change afterwards. Assigning to a field throws `TypeError` (verified by testing). It only comes from the `objects` of the [`detect`](av-capture-metadata-output/detect-event.md) event, or is converted by the preview layer's [`transformedMetadataObjectForMetadataObject()`](av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md).

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: `AVMetadataObject` doesn't inherit from any other class (verified by testing).

## Constructor

Can't be created with `new`: `new AVMetadataObject()` throws `TypeError` with the message `Illegal constructor: AVMetadataObject comes from the detect event of AVCaptureMetadataOutput` (verified by testing).

## Instance properties

| Property | Description |
| --- | --- |
| [`type`](av-metadata-object/type.md) <small>read-only</small> | What was recognized, such as `'qrCode'` or `'face'` |
| [`bounds`](av-metadata-object/bounds.md) <small>read-only</small> | Where it is in the picture, as a `CGRect` |

Whether `bounds` is a ratio from 0 to 1 or points in a layer depends on where it came from: taken directly from the `detect` event, it's a ratio (see [Coordinates in the picture](av-capture-metadata-output.md#coordinates-in-the-picture)); converted by the preview layer, it's points in the layer.

## Instance methods

None.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    const { x, y, width, height } = found.bounds;
    console.log(found.type, x.toFixed(2), y.toFixed(2), width.toFixed(2), height.toFixed(2));
  }
});
```

**Effect**: Once this output is added to a running session and the types to recognize are set, it prints a line for each thing recognized: the type, and its position in the picture (ratios from 0 to 1).

## Corresponding iOS API

`AVMetadataObject`. `type` is a string; `AVMetadataObjectTypeFace` is written `'face'`, and so on. `bounds` is a [`CGRect`](cg-rect.md).

## See also

- [`AVMetadataMachineReadableCodeObject`](av-metadata-machine-readable-code-object.md): a recognized code
- [`detect`](av-capture-metadata-output/detect-event.md): where recognized things come from
- [Coordinates in the picture](av-capture-metadata-output.md#coordinates-in-the-picture)
