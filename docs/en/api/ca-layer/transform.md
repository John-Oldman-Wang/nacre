---
type: reference
native: CALayer.transform
---

# `CALayer`: `transform` property

The **`transform`** property is the layer's three-dimensional transform: scaling, rotation, and translation along the x, y, and z directions, plus perspective.

## Value

A [`CATransform3D`](../ca-transform-3d.md).

- Readable and writable.
- Defaults to the identity matrix (`isIdentity` is `true`), meaning no transform at all. Set it back to [`CATransform3D.identity`](../ca-transform-3d/identity.md) to restore the original state.
- When writing, you can pass a `CATransform3D`, or a plain object with all 16 fields from `m11` to `m44`. Perspective is often written like this: `{ ...CATransform3D.identity, m34: -1 / 500 }`; see [Perspective](../ca-transform-3d.md#perspective).
- Reading returns a new `CATransform3D` with read-only fields. Changing the object you read does not affect the layer; to change it, assign a whole new one. See [Structs](../structs.md).
- The transform uses the center of the layer as its origin: rotation turns around the center, and scaling is relative to the center. For a view's own layer, the origin follows the view's [`anchorPoint`](../ui-view/anchorpoint.md). **The on-screen effect is not verified in the simulator.**
- A view's own layer: after writing a two-dimensional transform to the view's [`transform`](../ui-view/transform.md), `view.layer.transform` reads as the three-dimensional transform with the same effect, the same as what [`CATransform3D.fromAffineTransform()`](../ca-transform-3d/fromaffinetransform.md) computes.
- Fractional numbers written in read back the same within 1e-9; digit-for-digit equality is **not verified in the simulator**.

For translating, scaling, and rotating only within the plane of the screen, use the view's `transform` on a view; its value is the two-dimensional [`CGAffineTransform`](../cg-affine-transform.md), which is shorter to write. To rotate around the x or y axis, or to add perspective, write `view.layer.transform`.

### Invalid values

**`TypeError`**

- The value is not an object: `transform needs an object with all of: m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44`.
- A field is missing, or a field doesn't convert to a finite number: `transform is missing m12, or it is not a finite number`, with the missing field name in the middle.

On error, the property keeps its previous value.

## Examples

```js
const card = new CALayer();
card.frame = new CGRect(60, 160, 200, 120);
card.transform = CATransform3D.rotation(Math.PI / 4, 0, 1, 0)
  .concat({ ...CATransform3D.identity, m34: -1 / 500 });
console.log(card.transform.m34);
```

**Result**: The console prints `-0.002`. The layer rotates 45° around its vertical center line with perspective, one side near and the other far. **How it looks on screen is not verified in the simulator.**

To animate the transform, use `'transform'` as the `keyPath`, or a name such as `'transform.rotation.y'` that changes a single component; see [Animatable properties](../ca-property-animation.md#animatable-properties).

## Corresponding iOS API

`CALayer.transform`. `CATransform3DMakeRotation(a, 0, 1, 0)` is written `CATransform3D.rotation(a, 0, 1, 0)`.

## See also

- [`CATransform3D`](../ca-transform-3d.md): how to create and combine transforms
- [`sublayerTransform`](sublayertransform.md): the transform applied to all sublayers
- [`isDoubleSided`](isdoublesided.md): whether the back side is drawn
- [`UIView.transform`](../ui-view/transform.md): the two-dimensional transform on views
