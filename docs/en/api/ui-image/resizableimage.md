---
type: reference
native: "-[UIImage resizableImageWithCapInsets:resizingMode:]"
---

# `UIImage`: `resizableImage()` method

The **`resizableImage()`** method makes a nine-slice image: the four edges stay as they are, and only the middle stretches. When a nine-slice image is placed in a view larger than itself, the four corners don't distort. Use it for background images such as speech bubbles and rounded borders.

## Syntax

```
resizableImage({ withCapInsets, [resizingMode] })
```

### Parameters

**`options.withCapInsets`**

Required. A [`UIEdgeInsets`](../structs.md) object, or a plain object with the four numbers `top`, `left`, `bottom`, and `right`: how wide each of the four edges to keep, in [pt](../units.md).

**`options.resizingMode`**

Optional. How the middle is filled:

| Value | Effect |
| --- | --- |
| `'tile'` | Repeated tiling. The value when omitted |
| `'stretch'` | Stretching |

When omitted it is `'tile'`, not stretching; this is a measured result.

### Return value

A new `UIImage` whose [`capInsets`](capinsets.md) and [`resizingMode`](resizingmode.md) are the values given here. The original is unchanged. Called on an animated image, it gives a static image of the first frame.

### Exceptions

**`TypeError`**

- `withCapInsets` isn't passed: `resizableImage needs { withCapInsets }`.
- `withCapInsets` isn't an object: `withCapInsets needs an object with all of: top, left, bottom, right`.
- `withCapInsets` is missing a field, or a field isn't a finite number: `withCapInsets is missing top, or it is not a finite number`, with `top` replaced by the offending field name.
- `resizingMode` is misspelled: `resizingMode has no value "fill"; expected one of: …`.

## Examples

```js
const frameImage = UIImage.imageNamed('JS/assets/frame');
if (frameImage) {
  const a = frameImage.resizableImage({ withCapInsets: new UIEdgeInsets(6, 6, 6, 6) });
  const b = frameImage.resizableImage({
    withCapInsets: { top: 6, left: 6, bottom: 6, right: 6 },
    resizingMode: 'stretch',
  });
  console.log(a.capInsets.left, a.resizingMode);
  console.log(b.resizingMode);
}
```

**Result**: The console prints `6 tile` and `stretch`.

## Corresponding iOS API

`-[UIImage resizableImageWithCapInsets:]`, `-[UIImage resizableImageWithCapInsets:resizingMode:]`.

## See also

- [`capInsets`](capinsets.md), [`resizingMode`](resizingmode.md)
- [Displaying images](../../guides/images.md): making stretchable background images
