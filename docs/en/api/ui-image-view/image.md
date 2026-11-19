---
type: reference
native: UIImageView.image
---

# `UIImageView`: `image` property

The **`image`** property is the image the image view displays.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- The default value is `null`, meaning no image is shown. Assigning `null` doesn't cause an error; the result is that no image is shown, leaving only the background color (if `backgroundColor` is set).
- Reading returns the same object that was written.
- An animated image plays automatically; switching to a static image or `null` stops playback. See [Playing animated images](../ui-image-view.md#playing-animated-images).
- When positioned with constraints without constraining width and height, the view's size follows the image's `size`.

## Examples

```js
const iv = new UIImageView();
const star = UIImage.systemImageNamed('star.fill');
iv.image = star;
console.log(iv.image === star);
iv.image = null;
```

**Result**: the console logs `true`. After the last line the image view shows no image. How it looks after clearing is **not verified in the simulator**.

## Corresponding iOS API

`UIImageView.image`. The native image view doesn't play animated image files obtained with `+imageNamed:`; here it does.

## See also

- [`UIImage`](../ui-image.md)
- [`highlightedImage`](highlightedimage.md)
