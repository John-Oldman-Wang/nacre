---
type: reference
native: UIImage.size
---

# `UIImage`: `size` property

The **`size`** property is the image's width and height, in points, not pixels.

## Value

A [`CGSize`](../structs.md), in [pt](../units.md).

- Already rotated upright according to [`imageOrientation`](imageorientation.md).
- The pixel count equals `size` times [`scale`](scale.md). `dot.png` (10 pixels), `dot@2x.png` (20 pixels), and `dot@3x.png` (30 pixels) all read a `size` of 10 × 10.
- An image view positioned with constraints, with no width or height constraints, takes this size.

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.size.width, dot.size.height);
}
```

**Result**: When the project's `assets/` has the set of three `dot.png` files, the console prints `10 10`.

## Corresponding iOS API

`UIImage.size`.

## See also

- [`scale`](scale.md)
- [`size` is in points, not pixels](../ui-image.md#size-is-in-points-not-pixels)
