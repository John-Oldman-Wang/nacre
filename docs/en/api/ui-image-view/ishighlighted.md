---
type: reference
native: UIImageView.highlighted
---

# `UIImageView`: `isHighlighted` property

The **`isHighlighted`** property determines whether the image view is in the highlighted state, that is, whether it shows [`image`](image.md) or [`highlightedImage`](highlightedimage.md).

## Value

A boolean.

- Readable and writable.
- The default value is `false`.
- `true`: shows `highlightedImage`.
- `false`: shows `image`.
- The system doesn't change it automatically. `UIImageView` doesn't receive touches by default, so it doesn't become `true` when a finger presses on it. If you need the image to switch automatically while a finger is pressed, use [`UIButton`](../ui-button.md)'s `setImage()` to set a separate image for the `highlighted` state.

## Examples

```js
const iv = new UIImageView();
iv.image = UIImage.systemImageNamed('star');
iv.highlightedImage = UIImage.systemImageNamed('star.fill');
iv.isHighlighted = true;
iv.isHighlighted = false;
```

**Effect**: setting it to `true` shows a filled star; setting it back to `false` switches back to an outlined star. **The image switching is not verified in the simulator.**

## Corresponding iOS API

`UIImageView.highlighted` (the getter is `isHighlighted`).

## See also

- [`highlightedImage`](highlightedimage.md)
