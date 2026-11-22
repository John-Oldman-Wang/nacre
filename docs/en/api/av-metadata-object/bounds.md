---
type: reference
native: AVMetadataObject.bounds
---

# `AVMetadataObject`: `bounds` property

The **`bounds`** property is where the recognized thing is in the picture: the rectangle that encloses it.

## Value

A [`CGRect`](../cg-rect.md) (verified by testing). What the numbers mean depends on where the object came from:

| Where the object came from | What the numbers are |
| --- | --- |
| The `objects` of the [`detect`](../av-capture-metadata-output/detect-event.md) event | Fractions from 0 to 1; see [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture) |
| Converted by the preview layer's [`transformedMetadataObjectForMetadataObject()`](../av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) | Points (pt) in that layer, with the origin at the layer's top-left corner |

- Read-only. Assigning to it throws `TypeError`: `bounds is read-only`. The fields of the `CGRect` are read-only too.
- The value is fixed when the object is created and never changes. When the code moves, the next frame's `detect` brings new objects.

To draw a box on screen, convert to the layer first, then use the converted `bounds`.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  const first = e.objects[0];
  if (first !== undefined) {
    const box = first.bounds;
    console.log(box.x.toFixed(2), box.y.toFixed(2), box.width.toFixed(2), box.height.toFixed(2));
  }
});
```

**Effect**: While the session is capturing and a code is in front of the camera, each frame prints the position of the first code: four numbers between 0 and 1.

## Corresponding iOS API

`AVMetadataObject.bounds`.

## See also

- [`transformedMetadataObjectForMetadataObject()`](../av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md): convert to points in the layer
- [`corners`](../av-metadata-machine-readable-code-object/corners.md): the four corners of a code
- [Draw a box around each code](../../guides/scanning.md#draw-a-box-around-each-code)
