---
type: reference
native: CALayer.mask
---

# `CALayer`: `mask` property

The **`mask`** property is the layer's mask: another layer whose opaque parts decide where this layer is shown and where it isn't.

## Value

A [`CALayer`](../ca-layer.md) (including [`CAShapeLayer`](../ca-shape-layer.md) and [`CAGradientLayer`](../ca-gradient-layer.md)), or `null`.

- Readable and writable.
- Defaults to `null`, meaning no mask; the whole layer is shown as usual.
- You read back the same object you wrote. Write `null` to remove the mask.
- The layer keeps its mask: once written, you don't need to keep your own reference to the mask layer.
- Only the opacity at each point of the mask layer matters, not its color: where the mask is opaque, this layer is shown; where it is transparent, it isn't; where it is translucent, the layer is shown translucent. **The on-screen effect is not verified in the simulator.**
- The mask layer's `frame` is in this layer's own coordinate system, the same as for a sublayer. The mask layer is not added under any superlayer. **Not verified in the simulator.**

To do the same thing on a view, use [`UIView.maskView`](../ui-view/maskview.md), where the mask is a view.

### Invalid values

**`TypeError`**

The value is some other native object, such as a view:

```
TypeError: mask needs a CALayer or null
```

The value is not a native object:

```
TypeError: mask needs a native object or null, got "x"
```

On error, the property keeps its previous value.

## Examples

Use a circular shape layer to cut a square layer into a circle:

```js
const avatar = new CALayer();
avatar.frame = new CGRect(40, 120, 96, 96);
avatar.backgroundColor = 'systemTeal';

const circle = new CAShapeLayer();
circle.frame = new CGRect(0, 0, 96, 96);
circle.path = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 96, 96));
avatar.mask = circle;

console.log(avatar.mask === circle);
```

**Effect**

- The console prints `true`.
- The layer shows only the part inside the circle; the four corners aren't shown. A shape layer's fill color is black by default, which is opaque, so everything inside the circle is shown. **How it looks on screen is not verified in the simulator.**

If you only need rounded corners, use [`cornerRadius`](cornerradius.md) with [`masksToBounds`](maskstobounds.md); no mask is needed.

## Corresponding iOS API

`CALayer.mask`.

## See also

- [`masksToBounds`](maskstobounds.md): clipping to the layer's own bounds
- [`CAShapeLayer`](../ca-shape-layer.md): drawing the mask's shape with a path
- [`UIView.maskView`](../ui-view/maskview.md): masks on views
