---
type: reference
native: CATransform3DIsIdentity
---

# `CATransform3D`: `isIdentity` property

The **`isIdentity`** property tells whether this transform is the identity matrix, that is, no transform at all.

## Value

A boolean.

- `true`: `m11`, `m22`, `m33`, and `m44` are exactly 1, and the other 12 numbers are exactly 0.
- `false`: anything else. The comparison is exact equality of each number, with no tolerance.
- Read-only.

## Examples

```js
const layer = new CALayer();
console.log(layer.transform.isIdentity);
console.log(CATransform3D.scale(2).isIdentity);
console.log(CATransform3D.rotation(0, 0, 0, 1).isIdentity);
```

**Result**: logs `true`, `false`, and `true` in turn. A new layer's `transform` is the identity matrix; rotating by 0 radians is also the identity matrix.

## Corresponding iOS API

`CATransform3DIsIdentity(t)`.

## See also

- [`CATransform3D.identity`](identity.md)
- [`isAffine`](isaffine.md)
- [Structs](../structs.md): rules shared by all structs
