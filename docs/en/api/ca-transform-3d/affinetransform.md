---
type: reference
native: CATransform3DGetAffineTransform
---

# `CATransform3D`: `affineTransform` property

The **`affineTransform`** property is the two-dimensional part of this transform, as a [`CGAffineTransform`](../cg-affine-transform.md).

## Value

A `CGAffineTransform` whose six numbers come from these fields:

| `CGAffineTransform` field | Taken from |
| --- | --- |
| `a` | `m11` |
| `b` | `m12` |
| `c` | `m21` |
| `d` | `m22` |
| `tx` | `m41` |
| `ty` | `m42` |

- Read-only. Each read returns a new object.
- The other ten numbers are dropped. Only when [`isAffine`](isaffine.md) is `true` does the two-dimensional transform have the same effect as the original; when there is anything in the z direction or perspective, it is just what remains after removing those.

## Examples

```js
const t = CATransform3D.translation(5, 6);
if (t.isAffine) {
  console.log(String(t.affineTransform));
}
```

**Result**: logs `CGAffineTransform(1, 0, 0, 1, 5, 6)`.

## Corresponding iOS API

`CATransform3DGetAffineTransform(t)`.

## See also

- [`isAffine`](isaffine.md)
- [`CATransform3D.fromAffineTransform()`](fromaffinetransform.md): the other way, from two dimensions to three
- [Structs](../structs.md): rules shared by all structs
