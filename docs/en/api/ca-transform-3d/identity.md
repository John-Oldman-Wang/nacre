---
type: reference
native: CATransform3DIdentity
---

# `CATransform3D.identity` static property

The **`CATransform3D.identity`** static property is the identity matrix, meaning no transform at all.

## Value

A `CATransform3D`. The diagonal `m11`, `m22`, `m33`, and `m44` are 1; the other 12 numbers are 0.

- Read-only.
- Each read returns a new instance, so `CATransform3D.identity === CATransform3D.identity` is `false`. To test whether a transform is the identity, use [`isIdentity`](isidentity.md).
- A layer's `transform` is the identity matrix by default.
- To change one number starting from the identity matrix, create a plain object with spread syntax: `{ ...CATransform3D.identity, m34: -1 / 500 }`. That object can be written directly to a layer's `transform` or passed to [`concat()`](concat.md).

## Examples

```js
const layer = new CALayer();
console.log(layer.transform.isIdentity);
layer.transform = CATransform3D.rotation(0.5, 0, 1, 0);
layer.transform = CATransform3D.identity;
console.log(layer.transform.isIdentity);
```

**Result**: logs `true` and then `true`. A new layer's `transform` is the identity matrix; after writing the identity matrix back, the layer returns to its original state.

## Corresponding iOS API

`CATransform3DIdentity`.

## See also

- [`isIdentity`](isidentity.md)
- [`CALayer.transform`](../ca-layer/transform.md)
- [Structs](../structs.md): rules shared by all structs
