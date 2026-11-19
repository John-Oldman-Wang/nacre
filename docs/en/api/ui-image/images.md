---
type: reference
native: UIImage.images
---

# `UIImage`: `images` property

The **`images`** property is each frame of an animated image, in playback order.

## Value

An array of `UIImage`, or `null`.

- Each frame is a static image with the same `size` and `scale` as the whole image, and can be displayed on its own.
- `null` for a static image. To tell whether an image is animated, check whether this is `null`.
- Also `null` for an animated image that exceeds 64 MB after decoding; see [How much memory animated images use](../ui-image.md#how-much-memory-animated-images-use).

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading) {
  console.log(loading.images === null ? 0 : loading.images.length);
}
```

**Result**: When `anim.gif` has 4 frames, the console prints `4`.

## Corresponding iOS API

`UIImage.images`.

## See also

- [`frameDurations`](framedurations.md)
- [Animated images](../ui-image.md#animated-images)
