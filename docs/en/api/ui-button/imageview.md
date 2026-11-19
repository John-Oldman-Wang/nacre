---
type: reference
native: UIButton.imageView
---

# `UIButton`: `imageView` property

The **`imageView`** property is the [`UIImageView`](../ui-image.md) inside the button that displays the image.

## Value

[`UIImageView`](../ui-image.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- A `system` button has a value here even without an image set. Other button types are **not verified in the simulator**.
- Its type allows `null`, so check before using it.
- Set the image itself with [`setImage()`](setimage.md); don't change `imageView.image` directly.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setImage(UIImage.systemImageNamed('heart'), { forState: ['normal'] });
const view = button.imageView;
if (view) {
  view.contentMode = 'scaleAspectFit';
}
```

**Effect**: The image is displayed scaled to fit, keeping its aspect ratio. **Not verified in the simulator.**

## Corresponding iOS API

`UIButton.imageView`.

## See also

- [`setImage()`](setimage.md)
- [`titleLabel`](titlelabel.md)
