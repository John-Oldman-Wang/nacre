---
type: reference
native: CATransform3DMakeRotation
---

# `CATransform3D.rotation()` static method

The **`CATransform3D.rotation()`** static method creates a transform that rotates around an axis.

## Syntax

```
CATransform3D.rotation(radians, x, y, z)
```

### Parameters

**`radians`**

The rotation angle, in [radians](../units.md), not degrees. To convert degrees to radians: `degrees * Math.PI / 180`.

**`x`**, **`y`**, **`z`**

The direction of the axis. The axis passes through the origin (the center of the layer) along the direction (x, y, z). Only the direction counts, not the length: `(0, 0, 1)` and `(0, 0, 5)` give the same transform. The three common axes:

| Axis | Written as | Effect |
| --- | --- | --- |
| z axis | `(0, 0, 1)` | Rotates within the plane of the screen. Positive is clockwise on screen, the same as [`CGAffineTransform.rotation()`](../cg-affine-transform/rotation.md) |
| y axis | `(0, 1, 0)` | Rotates around the vertical center line, like turning a page of a book |
| x axis | `(1, 0, 0)` | Rotates around the horizontal center line, like flipping a wall calendar |

The direction follows the right-hand rule: point your right thumb along the axis, and the direction your fingers curl is positive. For example, rotating 90° around the x axis turns the y axis to where the z axis was.

### Return value

A new `CATransform3D`. It contains only the rotation: `m41`, `m42`, `m43` and the perspective numbers `m14`, `m24`, `m34` are all 0.

### Exceptions

**`RangeError`**

The axis is the zero vector, including when `x`, `y`, and `z` are all omitted: `rotation needs a non-zero axis (x, y, z)`.

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got …`, ending with the value received.

## Examples

```js
const flat = CATransform3D.rotation(Math.PI / 6, 0, 0, 1);
const same = CATransform3D.fromAffineTransform(CGAffineTransform.rotation(Math.PI / 6));
console.log(Math.abs(flat.m12 - same.m12) < 1e-9);

const tilt = CATransform3D.rotation(Math.PI / 2, 1, 0, 0);
console.log(Math.round(tilt.m21), Math.round(tilt.m22), Math.round(tilt.m23));
```

**Result**

- The first line logs `true`: rotating around the z axis is the same transform as the two-dimensional rotation.
- The second line logs `0 0 1`: after rotating 90° around the x axis, the original y axis points along the z axis.

```js
const card = new CALayer();
card.transform = CATransform3D.rotation(Math.PI / 4, 0, 1, 0);
```

**Effect**: the layer rotates 45° around its vertical center line. There is no perspective, so on screen it only becomes narrower; to make near things larger and far things smaller, see [Perspective](../ca-transform-3d.md#perspective). **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`CATransform3DMakeRotation(angle, x, y, z)`. When the axis is the zero vector, the ObjC result is undefined; here it throws `RangeError`.

## See also

- [`rotate()`](rotate.md): adds a rotation in front of an existing transform
- [Perspective](../ca-transform-3d.md#perspective)
- [Units](../units.md): radians and degrees
- [Structs](../structs.md): rules shared by all structs
