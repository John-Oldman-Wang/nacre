---
type: reference
native: "-[AVCaptureVideoPreviewLayer transformedMetadataObjectForMetadataObject:]"
---

# `AVCaptureVideoPreviewLayer`: `transformedMetadataObjectForMetadataObject()` method

The **`transformedMetadataObjectForMetadataObject()`** method converts an object recognized in a [`detect`](../av-capture-metadata-output/detect-event.md) event onto this layer: the converted object's position is in points in the layer, ready to draw a box on the layer.

## Syntax

```
transformedMetadataObjectForMetadataObject(metadataObject)
```

### Parameters

**`metadataObject`**

An object taken from the `objects` of a `detect` event (an [`AVMetadataObject`](../av-metadata-object.md) or an [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md)).

### Return value

A new object of the same class as the argument: a code object gives a code object (verified by testing). Its `type` and `stringValue` are the same as the argument's; `bounds` and `corners` are converted to points (pt) in this layer, with the origin at the layer's top-left corner, already accounting for the scaling and cropping of [`videoGravity`](videogravity.md).

`null` when it can't be converted.

The argument itself doesn't change.

### Exceptions

**`TypeError`**

The argument didn't come from a `detect` event (an object you created, a plain object): `transformedMetadataObjectForMetadataObject needs an object from a detect event, got …` (verified by testing).

## Description

- Convert right away inside the `detect` listener. If the layer's `frame` or `videoGravity` changes later, positions converted earlier no longer match.
- The converted position is in points in this layer. When the layer fills a view, it's also in points in that view, and can be used directly as the `frame` of a view laid on top.

## Examples

```js
const session = new AVCaptureSession();
const preview = new AVCaptureVideoPreviewLayer(session);
preview.frame = new CGRect(0, 0, 300, 400);
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    const onLayer = preview.transformedMetadataObjectForMetadataObject(found);
    if (onLayer !== null) {
      const box = onLayer.bounds;
      console.log(Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height));
    }
  }
});
```

**Effect**: After `session` is connected to a camera, `output` is added, and capturing starts, whenever a code is in front of the camera each code prints one line per frame: its position and size in the 300 × 400 pt layer, in pt.

## Corresponding iOS API

`-[AVCaptureVideoPreviewLayer transformedMetadataObjectForMetadataObject:]`.

## See also

- [Draw a box around each code](../../guides/scanning.md#draw-a-box-around-each-code)
- [`bounds`](../av-metadata-object/bounds.md), [`corners`](../av-metadata-machine-readable-code-object/corners.md)
