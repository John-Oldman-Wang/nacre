---
type: reference
native: UIImageView.highlightedImage
---

# `UIImageView`: `highlightedImage` property

The **`highlightedImage`** property is the image displayed when the image view is in the highlighted state.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- The default value is `null`, meaning [`image`](image.md) is still shown when highlighted. **How it looks when `null` is not verified in the simulator.**
- It is shown only when [`isHighlighted`](ishighlighted.md) is `true`.
- If it is an animated image, it plays while `isHighlighted` is `true`.

## Examples

```js
const iv = new UIImageView();
iv.image = UIImage.systemImageNamed('star');
iv.highlightedImage = UIImage.systemImageNamed('star.fill');
iv.isHighlighted = true;
```

**Effect**: the image view switches from an outlined star to a filled star. **Not verified in the simulator.**

## Corresponding iOS API

`UIImageView.highlightedImage`.

## See also

- [`isHighlighted`](ishighlighted.md)
