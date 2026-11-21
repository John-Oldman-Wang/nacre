---
type: reference
native: CATransform3DRotate
---

# `CATransform3D`: `rotate()` method

The **`rotate()`** method adds a rotation in front of the receiver: rotate first, then apply the receiver's transform.

## Syntax

```
rotate(radians, x, y, z)
```

### Parameters

**`radians`**

The rotation angle, in [radians](../units.md).

**`x`**, **`y`**, **`z`**

The direction of the axis, the same as the arguments of [`CATransform3D.rotation()`](rotation.md).

### Return value

A new `CATransform3D`, equal to `CATransform3D.rotation(radians, x, y, z).concat(receiver)`. The receiver does not change.

### Exceptions

**`RangeError`**

The axis is the zero vector, including when `x`, `y`, and `z` are all omitted: `rotation needs a non-zero axis (x, y, z)`.

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got …`, ending with the value received.

## Description

The rotation comes first, so if the receiver has perspective, the perspective acts on the layer after it has been rotated. This is the most common way to add perspective: create a matrix with only perspective, then call `rotate()`.

## Examples

```js
const perspective = new CATransform3D(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, -1 / 500,
  0, 0, 0, 1);

const card = new CALayer();
card.transform = perspective.rotate(Math.PI / 4, 0, 1, 0);
console.log(card.transform.isAffine);
```

**Effect**

- The layer rotates 45° around its vertical center line, and the side turned into the screen gets smaller. **How it looks on screen is not verified in the simulator.**
- The console logs `false`.

## Corresponding iOS API

`CATransform3DRotate(t, angle, x, y, z)` is written `t.rotate(angle, x, y, z)`, with the same order.

## See also

- [`CATransform3D.rotation()`](rotation.md)
- [Perspective](../ca-transform-3d.md#perspective)
- [Structs](../structs.md): rules shared by all structs
