---
type: reference
native: CATransform3D
---

# `CATransform3D`

**`CATransform3D`** represents a three-dimensional transform: scaling, rotation, and translation along the x, y, and z directions, perspective, and combinations of them. The value of the [`transform`](ca-layer/transform.md) and [`sublayerTransform`](ca-layer/sublayertransform.md) properties of [`CALayer`](ca-layer.md) is one of these.

Axis directions: x points right, y points down, and z points out of the screen, toward the person looking at it.

The 16 fields are the 16 numbers of the 4 × 4 matrix below. The first digit after `m` is the row, the second is the column:

```
| m11 m12 m13 m14 |
| m21 m22 m23 m24 |
| m31 m32 m33 m34 |
| m41 m42 m43 m44 |
```

To transform a point (x, y, z), it is written as a row `[x y z 1]` and multiplied on the left of the matrix:

```
x' = x * m11 + y * m21 + z * m31 + m41
y' = x * m12 + y * m22 + z * m32 + m42
z' = x * m13 + y * m23 + z * m33 + m43
w' = x * m14 + y * m24 + z * m34 + m44
```

The point ends up at (x' / w', y' / w', z' / w'). So the translation is in the fourth row (`m41`, `m42`, `m43`, in [pt](units.md)), and the numbers used for perspective are in the fourth column (the most common one is `m34`). The fields are laid out the same way as the ObjC `CATransform3D`: `m34` in ObjC code is the same number as `m34` here. In math references written with column vectors, the matrix is the transpose of this one and the translation is in the fourth column.

In everyday use you do not need to fill in these 16 numbers directly: create basic transforms with the static methods, then combine them with [`concat()`](ca-transform-3d/concat.md). Perspective requires writing `m34` directly; see [Perspective](#perspective).

Fields are read-only; to change one, replace the whole value with a new one. When writing a layer's `transform`, you can also pass a plain object with all the fields. Every read of the property returns a new object. These rules hold for all structs; see [Structs](structs.md). The transform methods compute in JS and return new objects without modifying the receiver.

**Inheritance**: none. `CATransform3D` is a plain JS class; it does not inherit from `NSObject` and is not an `EventTarget`.

## Constructor

[`CATransform3D()`](ca-transform-3d/constructor.md)

Gives the 16 numbers of the matrix directly. Omitted arguments are 0, so `new CATransform3D()` is not the identity matrix.

## Static properties

[`CATransform3D.identity`](ca-transform-3d/identity.md)

The identity matrix, meaning no transform at all. Each read returns a new instance.

## Static methods

| Method | Description |
| --- | --- |
| [`CATransform3D.translation()`](ca-transform-3d/translation.md) | Translation, in pt |
| [`CATransform3D.scale()`](ca-transform-3d/scale-static.md) | Scaling. With one argument, the x and y directions are the same |
| [`CATransform3D.rotation()`](ca-transform-3d/rotation.md) | Rotation around an axis; the argument is in radians |
| [`CATransform3D.fromAffineTransform()`](ca-transform-3d/fromaffinetransform.md) | Turns a two-dimensional [`CGAffineTransform`](cg-affine-transform.md) into a three-dimensional one |

## Instance properties

The 16 numbers of the matrix:

| Property | Description |
| --- | --- |
| [`m11`](ca-transform-3d/m11.md) <small>read-only</small> | Row 1, column 1. With only scaling, the multiple in the x direction |
| [`m12`](ca-transform-3d/m12.md) <small>read-only</small> | Row 1, column 2 |
| [`m13`](ca-transform-3d/m13.md) <small>read-only</small> | Row 1, column 3 |
| [`m14`](ca-transform-3d/m14.md) <small>read-only</small> | Row 1, column 4; used for perspective |
| [`m21`](ca-transform-3d/m21.md) <small>read-only</small> | Row 2, column 1 |
| [`m22`](ca-transform-3d/m22.md) <small>read-only</small> | Row 2, column 2. With only scaling, the multiple in the y direction |
| [`m23`](ca-transform-3d/m23.md) <small>read-only</small> | Row 2, column 3 |
| [`m24`](ca-transform-3d/m24.md) <small>read-only</small> | Row 2, column 4; used for perspective |
| [`m31`](ca-transform-3d/m31.md) <small>read-only</small> | Row 3, column 1 |
| [`m32`](ca-transform-3d/m32.md) <small>read-only</small> | Row 3, column 2 |
| [`m33`](ca-transform-3d/m33.md) <small>read-only</small> | Row 3, column 3. With only scaling, the multiple in the z direction |
| [`m34`](ca-transform-3d/m34.md) <small>read-only</small> | Row 3, column 4; used for perspective |
| [`m41`](ca-transform-3d/m41.md) <small>read-only</small> | Translation in the x direction, pt |
| [`m42`](ca-transform-3d/m42.md) <small>read-only</small> | Translation in the y direction, pt |
| [`m43`](ca-transform-3d/m43.md) <small>read-only</small> | Translation in the z direction, pt |
| [`m44`](ca-transform-3d/m44.md) <small>read-only</small> | Row 4, column 4; usually 1 |

Computed from these 16 numbers:

| Property | Description |
| --- | --- |
| [`isIdentity`](ca-transform-3d/isidentity.md) <small>read-only</small> | Whether it is the identity matrix |
| [`isAffine`](ca-transform-3d/isaffine.md) <small>read-only</small> | Whether it can be expressed as a two-dimensional `CGAffineTransform` |
| [`affineTransform`](ca-transform-3d/affinetransform.md) <small>read-only</small> | The two-dimensional part, as a `CGAffineTransform` |

## Instance methods

| Method | Description |
| --- | --- |
| [`concat()`](ca-transform-3d/concat.md) | Combines with another transform: this one first, then the other |
| [`translate()`](ca-transform-3d/translate.md) | Translates first, then applies this one |
| [`scale()`](ca-transform-3d/scale.md) | Scales first, then applies this one |
| [`rotate()`](ca-transform-3d/rotate.md) | Rotates first, then applies this one |
| [`invert()`](ca-transform-3d/invert.md) | The inverse transform. Returns `null` when not invertible |
| [`toString()`](ca-transform-3d/tostring.md) | Formats as `CATransform3D(m11, m12, …, m44)` |

## Order of combination

`a.concat(b)` applies `a` first, then `b`. The two orders give different results:

```js
const move = CATransform3D.translation(10, 0, 0);
const grow = CATransform3D.scale(2);

console.log(move.concat(grow).m41);
console.log(grow.concat(move).m41);
```

**Result**

- The first line logs `20`: translate first, then scale, so the translation is doubled too.
- The second line logs `10`: scale first, then translate, so the translation is not affected by the scaling.

The three instance methods `translate()`, `scale()`, and `rotate()` put the new step **in front**: `t.rotate(...)` equals `CATransform3D.rotation(...).concat(t)`, rotating first and then applying `t`. This matches ObjC's `CATransform3DRotate(t, ...)`.

## Perspective

Without perspective, w' is always 1 and distant points do not get smaller. So a layer rotated 45° around the y axis just becomes narrower on screen. **How it looks on screen is not verified in the simulator.**

To make near things larger and far things smaller, set `m34` to `-1 / d`. `d` is the distance from the viewer to the plane of the screen, in pt. The smaller `d` is, the stronger the perspective. When writing to a layer you can pass a plain object directly:

```js
const layer = new CALayer();
layer.transform = { ...CATransform3D.identity, m34: -1 / 500 };
console.log(layer.transform.m34);
```

**Result**: logs `-0.002`.

Perspective has to come **after** the rotation. A layer starts out flat, with z equal to 0 at every point; if perspective is applied first, the `z * m34` term is 0 and nothing changes. Create a matrix with perspective using the constructor, then call [`rotate()`](ca-transform-3d/rotate.md); that rotates first and applies perspective afterward:

```js
const perspective = new CATransform3D(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, -1 / 500,
  0, 0, 0, 1);

const card = new CALayer();
card.transform = perspective.rotate(Math.PI / 4, 0, 1, 0);
```

**Effect**: the layer rotates 45° around its vertical center line; the side turned into the screen gets smaller and the side turned out gets larger. **How it looks on screen is not verified in the simulator.**

When a group of layers should share one perspective, write `m34` on their superlayer's [`sublayerTransform`](ca-layer/sublayertransform.md), and put only the rotation in each sublayer's `transform`.

## Examples

Starting from a blank app, rotate a card 45° around its vertical center line, with perspective.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const card = new UIView();
  card.frame = new CGRect(60, 160, 200, 120);
  card.backgroundColor = 'systemIndigo';
  card.layer.cornerRadius = 16;
  page.view.addSubview(card);

  const perspective = new CATransform3D(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, -1 / 500,
    0, 0, 0, 1);
  card.layer.transform = perspective.rotate(Math.PI / 4, 0, 1, 0);

  console.log(card.layer.transform.isAffine);
});
```

**Effect**

- A 200 × 120 pt indigo card appears on screen, rotated 45° around its vertical center line, with one side near and the other far. **How it looks on screen is not verified in the simulator.**
- The console logs `false`: a transform with perspective cannot be expressed as a two-dimensional `CGAffineTransform`.

Fields with fractional values written to a layer and read back are the same within 1e-9; the acceptance tests compare with that tolerance. Digit-for-digit equality is **not verified in the simulator**. Allow a tolerance when comparing:

```js
const layer = new CALayer();
const turn = CATransform3D.rotation(0.5, 0, 1, 0);
layer.transform = turn;
console.log(Math.abs(layer.transform.m11 - turn.m11) < 1e-9);
```

**Result**: logs `true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `CATransform3DIdentity` | `CATransform3D.identity` |
| `CATransform3DMakeTranslation(tx, ty, tz)` | `CATransform3D.translation(tx, ty, tz)` |
| `CATransform3DMakeScale(sx, sy, sz)` | `CATransform3D.scale(sx, sy, sz)` |
| `CATransform3DMakeRotation(angle, x, y, z)` | `CATransform3D.rotation(angle, x, y, z)` |
| `CATransform3DMakeAffineTransform(m)` | `CATransform3D.fromAffineTransform(m)` |
| `CATransform3DConcat(a, b)` | `a.concat(b)` |
| `CATransform3DTranslate(t, tx, ty, tz)` | `t.translate(tx, ty, tz)` |
| `CATransform3DScale(t, sx, sy, sz)` | `t.scale(sx, sy, sz)` |
| `CATransform3DRotate(t, angle, x, y, z)` | `t.rotate(angle, x, y, z)` |
| `CATransform3DInvert(t)` (returns `t` itself when not invertible) | `t.invert()` (returns `null` when not invertible) |
| `CATransform3DIsIdentity(t)` | `t.isIdentity` |
| `CATransform3DIsAffine(t)` | `t.isAffine` |
| `CATransform3DGetAffineTransform(t)` | `t.affineTransform` |
| `t.m34 = -1.0 / 500` (changes one field of the struct) | `{ ...t, m34: -1 / 500 }` (creates a new plain object) |

## See also

- [`CALayer.transform`](ca-layer/transform.md): a layer's three-dimensional transform
- [`CALayer.sublayerTransform`](ca-layer/sublayertransform.md): a shared perspective for a group of sublayers
- [`CAPropertyAnimation`](ca-property-animation.md#animatable-properties): the `keyPath` names for animating a transform
- [`CGAffineTransform`](cg-affine-transform.md): the two-dimensional transform used by views
- [Structs](structs.md): rules shared by all structs
- [Units](units.md): pt, radians, and degrees
