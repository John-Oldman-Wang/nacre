---
type: reference
native: UIImage.symbolImage
---

# `UIImage`: `isSymbolImage` property

The **`isSymbolImage`** property indicates whether this image is an SF Symbols icon.

## Value

A boolean.

- `true`: this image is an SF Symbols icon, obtained with [`systemImageNamed()`](systemimagenamed.md).
- `false`: an ordinary image.

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  console.log(star.isSymbolImage);
}
```

**Result**: The console prints `true`.

## Corresponding iOS API

`UIImage.symbolImage`.

## See also

- [`systemImageNamed()`](systemimagenamed.md)
