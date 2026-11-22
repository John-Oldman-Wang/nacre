---
type: reference
native: AVMetadataMachineReadableCodeObject.corners
---

# `AVMetadataMachineReadableCodeObject`: `corners` property

The **`corners`** property is the positions of the code's four corners in the picture. When the code is tilted, the quadrilateral joining the four corners fits it more tightly than [`bounds`](../av-metadata-object/bounds.md).

## Value

An array of [`CGPoint`](../cg-point.md). Scanning a QR code, testing gives 4 points.

- The coordinate system is the same as the same object's `bounds`: from the [`detect`](../av-capture-metadata-output/detect-event.md) event they are fractions from 0 to 1; after conversion with the preview layer's [`transformedMetadataObjectForMetadataObject()`](../av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) they are points (pt) in the layer.
- Read-only. Assigning to it throws `TypeError`: `corners is read-only`. The array itself is frozen too; you can't add or remove items.
- The value is fixed when the object is created and never changes.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    if (found instanceof AVMetadataMachineReadableCodeObject) {
      console.log(found.corners.map((p) => p.x.toFixed(2) + ',' + p.y.toFixed(2)).join(' '));
    }
  }
});
```

**Effect**: While the session is capturing and a QR code is in front of the camera, each code prints one line per frame: four points between 0 and 1.

## Corresponding iOS API

`AVMetadataMachineReadableCodeObject.corners`. In ObjC each corner is a dictionary that has to be turned into a point with `CGPointMakeWithDictionaryRepresentation`; here each one is a `CGPoint` directly.

## See also

- [`bounds`](../av-metadata-object/bounds.md): the rectangle enclosing the code
- [Draw a box around each code](../../guides/scanning.md#draw-a-box-around-each-code)
