---
type: reference
native: UIImage.renderingMode
---

# `UIImage`: `renderingMode` property

The **`renderingMode`** property decides whether the image's own colors are used when it is displayed.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'automatic'` | Decided by where the image is used. Every newly obtained image has this value |
| `'alwaysOriginal'` | Always shows the image's own colors; `tintColor` has no effect |
| `'alwaysTemplate'` | Always treated as a template image: the image's own colors are ignored, only its shape is used, and the whole image is colored with `tintColor` |

SF Symbols icons are also `'automatic'`. To change it, make a new image with [`imageWithRenderingMode()`](imagewithrenderingmode.md).

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  const original = star.imageWithRenderingMode('alwaysOriginal');
  console.log(original.renderingMode, star.renderingMode);
}
```

**Result**: The console prints `alwaysOriginal automatic`. The original is unchanged.

## Corresponding iOS API

`UIImage.renderingMode`.

## See also

- [Rendering mode and `tintColor`](../ui-image.md#rendering-mode-and-tintcolor)
- [`imageWithRenderingMode()`](imagewithrenderingmode.md)
