---
type: reference
native: CALayer.contents
---

# `CALayer`: `contents` property

The **`contents`** property is the image the layer displays.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- Defaults to `null`, meaning no content.
- You read back the same object you wrote.
- The image is stretched to fill the layer. To place the image some other way, use [`UIImageView`](../ui-image-view.md).
- An animated image written here shows its first frame. To play it, see the guide [Displaying images](../../guides/images.md#controlling-animated-image-playback-yourself).
- Only write `contents` on layers you created yourself. The content of a view's own layer (`view.layer`) is managed by the view.
- `imageNamed()` returns `null` when it can't find the image, and `contents = null` doesn't fail.

### Invalid values

**`TypeError`**

The written value is neither a `UIImage` nor `null`:

```
TypeError: contents needs a native object or null, got "x"
```

## Examples

```js
const dot = UIImage.imageNamed('JS/assets/dot');
const badge = new CALayer();
badge.frame = new CGRect(20, 20, 40, 40);
badge.contents = dot;
console.log(badge.contents === dot);
```

**Result**: The console prints `true`. The image is stretched to 40 × 40 pt; how it looks on screen is **not verified in the simulator**.

## Corresponding iOS API

`CALayer.contents`. In ObjC you write `(id)image.CGImage`; here you write the `UIImage` directly.

## See also

- [`UIImage`](../ui-image.md)
