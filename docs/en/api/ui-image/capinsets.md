---
type: reference
native: UIImage.capInsets
---

# `UIImage`: `capInsets` property

The **`capInsets`** property is the widths kept on the four edges of a nine-slice image. These four edges don't stretch when the image is stretched.

## Value

A [`UIEdgeInsets`](../structs.md), with all four values in [pt](../units.md).

For an image that hasn't been made into a nine-slice image, all four values are 0. For an image made by [`resizableImage()`](resizableimage.md), they are the values given when it was made.

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const frameImage = UIImage.imageNamed('JS/assets/frame');
if (frameImage) {
  const a = frameImage.resizableImage({ withCapInsets: new UIEdgeInsets(6, 6, 6, 6) });
  console.log(frameImage.capInsets.left, a.capInsets.left);
}
```

**Result**: The console prints `0 6`.

## Corresponding iOS API

`UIImage.capInsets`.

## See also

- [`resizableImage()`](resizableimage.md)
- [`resizingMode`](resizingmode.md)
