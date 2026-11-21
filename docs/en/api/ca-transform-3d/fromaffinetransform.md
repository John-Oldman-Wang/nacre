---
type: reference
native: CATransform3DMakeAffineTransform
---

# `CATransform3D.fromAffineTransform()` static method

The **`CATransform3D.fromAffineTransform()`** static method turns a two-dimensional [`CGAffineTransform`](../cg-affine-transform.md) into a three-dimensional transform with the same effect.

## Syntax

```
CATransform3D.fromAffineTransform(transform)
```

### Parameters

**`transform`**

A `CGAffineTransform`, or a plain object with the six fields `a`, `b`, `c`, `d`, `tx`, and `ty`.

### Return value

A new `CATransform3D`. The six numbers go to the corresponding positions, and the z direction is unchanged:

| `CGAffineTransform` field | Goes to |
| --- | --- |
| `a` | `m11` |
| `b` | `m12` |
| `c` | `m21` |
| `d` | `m22` |
| `tx` | `m41` |
| `ty` | `m42` |

`m33` and `m44` are 1, and the rest are 0. To go the other way and take the two-dimensional part, use [`affineTransform`](affinetransform.md).

### Exceptions

**`TypeError`**

- `transform` is not an object: `fromAffineTransform needs an object with all of: a, b, c, d, tx, ty`.
- `transform` is missing a field, or a field cannot be converted to a finite number: `fromAffineTransform is missing tx, or it is not a finite number`, with the missing field name in the middle.

## Examples

```js
const flat = new CGAffineTransform(1, 2, 3, 4, 5, 6);
const t = CATransform3D.fromAffineTransform(flat);
console.log(t.m11, t.m12, t.m21, t.m22, t.m41, t.m42, t.m33, t.m44);
```

**Result**: logs `1 2 3 4 5 6 1 1`.

## Corresponding iOS API

`CATransform3DMakeAffineTransform(m)`.

## See also

- [`affineTransform`](affinetransform.md): the other way, taking the two-dimensional part of a three-dimensional transform
- [`CGAffineTransform`](../cg-affine-transform.md)
- [Structs](../structs.md): rules shared by all structs
