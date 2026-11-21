---
type: reference
native: CATransform3D
---

# `CATransform3D()` constructor

The **`CATransform3D()`** constructor creates a transform from the 16 numbers of the matrix given directly.

In everyday use you do not need to fill in these 16 numbers directly: create basic transforms with [`translation()`](translation.md), [`scale()`](scale-static.md), and [`rotation()`](rotation.md), then combine them with [`concat()`](concat.md). Use the constructor only to write perspective (`m34`), or when those methods cannot produce the transform you need.

## Syntax

```
new CATransform3D()
new CATransform3D(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44)
```

### Parameters

**`m11`** … **`m44`**

The 16 numbers of the matrix, given row by row: the four numbers of the first row, then the second row, and so on. Their positions:

```
| m11 m12 m13 m14 |
| m21 m22 m23 m24 |
| m31 m32 m33 m34 |
| m41 m42 m43 m44 |
```

`m41`, `m42`, and `m43` are translations, in [pt](../units.md); `m14`, `m24`, and `m34` are used for perspective, in reciprocal pt; the rest are ratios with no unit.

Every argument can be omitted. Arguments that are given are converted to numbers; omitted ones are 0, so `new CATransform3D()` gives 16 zeros, not the identity matrix; for the identity matrix use [`CATransform3D.identity`](identity.md).

### Return value

A new `CATransform3D`. Its fields are read-only.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got "x"`, ending with the value received.

## Examples

```js
const perspective = new CATransform3D(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, -1 / 500,
  0, 0, 0, 1);
console.log(String(perspective));
console.log(new CATransform3D().isIdentity);
```

**Result**

- The first line logs `CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -0.002, 0, 0, 0, 1)`: the identity matrix plus perspective in `m34`.
- The second line logs `false`: with no arguments, all 16 numbers are 0.

## Corresponding iOS API

ObjC has no constructor; you write the struct fields directly: `CATransform3D t = { 1, 0, 0, 0, … }`, or start from `CATransform3DIdentity` and change one field.

## See also

- [`CATransform3D.identity`](identity.md): the identity matrix
- [Perspective](../ca-transform-3d.md#perspective)
- [Structs](../structs.md): rules shared by all structs
