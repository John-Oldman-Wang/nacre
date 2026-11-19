---
type: reference
native: UIView.maskView
---

# `UIView`: `maskView` property

The **`maskView`** property is the view's mask: another view. This view shows through only beneath the opaque parts of the mask.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- The default is `null` (verified by testing).
- Reads back as the same object that was written; writing `null` removes the mask (verified by testing).
- This view retains the mask view; you don't need to keep a separate reference. Don't also add the mask view to the view hierarchy. **Not verified in the simulator.**
- The on-screen effect of the mask is **not verified in the simulator**.

## Examples

```js
const photo = new UIImageView();
photo.frame = new CGRect(0, 0, 120, 120);

const circle = new UIView();
circle.frame = new CGRect(0, 0, 120, 120);
circle.backgroundColor = 'black';
circle.layer.cornerRadius = 60;

photo.maskView = circle;
console.log(photo.maskView === circle);
```

**Effect**: The image shows only inside the circle. Logs `true`. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`UIView.maskView`.

## See also

- [`CALayer`](../ca-layer.md): the layer's `mask`
- [`clipsToBounds`](clipstobounds.md)
