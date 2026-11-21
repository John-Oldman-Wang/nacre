---
type: reference
native: CATransform3DIsAffine
---

# `CATransform3D`: `isAffine` property

The **`isAffine`** property tells whether this transform can be expressed as a two-dimensional [`CGAffineTransform`](../cg-affine-transform.md): it only translates, scales, and rotates within the plane of the screen, does not touch the z direction, and has no perspective.

## Value

A boolean.

- `true`: these numbers have exactly these values: `m13`, `m14`, `m23`, `m24`, `m31`, `m32`, `m34`, and `m43` are 0, and `m33` and `m44` are 1. In that case the two-dimensional transform from [`affineTransform`](affinetransform.md) has the same effect.
- `false`: anything else, such as a translation in the z direction, a rotation around the x or y axis, or perspective. The comparison is exact equality, with no tolerance.
- Read-only.

## Examples

```js
console.log(CATransform3D.translation(5, 6).isAffine);
console.log(CATransform3D.translation(5, 6, 1).isAffine);

const perspective = new CATransform3D(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, -1 / 500,
  0, 0, 0, 1);
console.log(perspective.isAffine);
```

**Result**: logs `true`, `false`, and `false` in turn. A translation in the z direction and a transform with perspective cannot be expressed as two-dimensional transforms.

## Corresponding iOS API

`CATransform3DIsAffine(t)`.

## See also

- [`affineTransform`](affinetransform.md)
- [`CATransform3D.fromAffineTransform()`](fromaffinetransform.md)
- [Structs](../structs.md): rules shared by all structs
