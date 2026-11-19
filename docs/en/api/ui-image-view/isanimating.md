---
type: reference
native: UIImageView.animating
---

# `UIImageView`: `isAnimating` property

The **`isAnimating`** property indicates whether the image view is playing a frame-by-frame animation set up with an array of images.

## Value

A boolean.

- Read-only; assigning to it throws `TypeError`.
- Setting up a frame-by-frame animation with an array of images (the native `animationImages`) isn't available yet, so it is always `false`.
- **Playback of animated images isn't reflected in this property.** It is still `false` after an animated image is assigned to [`image`](image.md). To tell whether an animated image is playing in the image view, read `iv.layer.animationForKey('nacreImageFrames')`. See [Playing animated images](../ui-image-view.md#playing-animated-images).

## Examples

```js
const iv = new UIImageView();
const loading = UIImage.imageNamed('JS/assets/anim.gif');
iv.image = loading;
console.log(iv.isAnimating);
```

**Result**: the console logs `false`.

## Corresponding iOS API

`UIImageView.animating` (the getter is `isAnimating`).

## See also

- [Playing animated images](../ui-image-view.md#playing-animated-images)
