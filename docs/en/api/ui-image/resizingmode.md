---
type: reference
native: UIImage.resizingMode
---

# `UIImage`: `resizingMode` property

The **`resizingMode`** property is how the middle of a nine-slice image is filled.

## Value

A string, one of these two:

| Value | Effect |
| --- | --- |
| `'tile'` | The middle is tiled repeatedly |
| `'stretch'` | The middle is stretched |

When [`resizableImage()`](resizableimage.md) is called without `resizingMode`, it is `'tile'`. With a solid-color middle the two look the same; with a gradient or pattern they differ.

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const frameImage = UIImage.imageNamed('JS/assets/frame');
if (frameImage) {
  const b = frameImage.resizableImage({
    withCapInsets: { top: 6, left: 6, bottom: 6, right: 6 },
    resizingMode: 'stretch',
  });
  console.log(b.resizingMode);
}
```

**Result**: The console prints `stretch`.

## Corresponding iOS API

`UIImage.resizingMode`.

## See also

- [`resizableImage()`](resizableimage.md)
- [`capInsets`](capinsets.md)
