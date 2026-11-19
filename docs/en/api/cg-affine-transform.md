---
type: reference
native: CGAffineTransform
---

# `CGAffineTransform`

**`CGAffineTransform`** represents a two-dimensional affine transform: scaling, rotation, translation, and combinations of them. The value of the [`transform`](ui-view/transform.md) property of [`UIView`](ui-view.md) is one of these.

The six fields are the six numbers in the matrix below. `tx` and `ty` are translations, in [pt](units.md); the other four are ratios with no unit.

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

In everyday use you do not need to fill in these six numbers directly: create basic transforms with the three static methods, then combine them with [`concat()`](cg-affine-transform/concat.md).

Fields are read-only; to change one, replace the whole value with a new one. When writing a view's `transform`, you can also pass a plain object with all the fields. Every read of the property returns a new object. These rules hold for all structs; see [Structs](structs.md). The transform methods compute in JS and return new objects without modifying the receiver.

**Inheritance**: none. `CGAffineTransform` is a plain JS class; it does not inherit from `NSObject` and is not an `EventTarget`.

## Constructor

[`CGAffineTransform()`](cg-affine-transform/constructor.md)

Gives the six numbers of the matrix directly. Omitted arguments are 0, so `new CGAffineTransform()` is not the identity matrix.

## Static properties

[`CGAffineTransform.identity`](cg-affine-transform/identity.md)

The identity matrix, meaning no transform at all. Each read returns a new instance.

## Static methods

| Method | Description |
| --- | --- |
| [`CGAffineTransform.scale()`](cg-affine-transform/scale.md) | Scaling. With one argument, both directions are the same |
| [`CGAffineTransform.translation()`](cg-affine-transform/translation.md) | Translation, in pt |
| [`CGAffineTransform.rotation()`](cg-affine-transform/rotation.md) | Rotation; the argument is in radians, positive is clockwise |

## Instance properties

| Property | Description |
| --- | --- |
| [`a`](cg-affine-transform/a.md) <small>read-only</small> | Matrix row 1, column 1 |
| [`b`](cg-affine-transform/b.md) <small>read-only</small> | Matrix row 1, column 2 |
| [`c`](cg-affine-transform/c.md) <small>read-only</small> | Matrix row 2, column 1 |
| [`d`](cg-affine-transform/d.md) <small>read-only</small> | Matrix row 2, column 2 |
| [`tx`](cg-affine-transform/tx.md) <small>read-only</small> | Horizontal translation, pt |
| [`ty`](cg-affine-transform/ty.md) <small>read-only</small> | Vertical translation, pt |
| [`isIdentity`](cg-affine-transform/isidentity.md) <small>read-only</small> | Whether it is the identity matrix |

## Instance methods

| Method | Description |
| --- | --- |
| [`concat()`](cg-affine-transform/concat.md) | Combines with another transform: this one first, then the other |
| [`invert()`](cg-affine-transform/invert.md) | The inverse transform. Returns `null` when not invertible |
| [`toString()`](cg-affine-transform/tostring.md) | Formats as `CGAffineTransform(a, b, c, d, tx, ty)` |

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const box = new UIView();
  box.frame = new CGRect(40, 120, 100, 100);
  box.backgroundColor = 'systemIndigo';
  page.view.addSubview(box);

  box.transform = CGAffineTransform.rotation(Math.PI / 6);
  box.transform = CGAffineTransform.scale(1.2);
  box.transform = CGAffineTransform.scale(1.2)
    .concat(CGAffineTransform.rotation(Math.PI / 6));
});
```

**Effect**

- First assignment: `box` rotates 30° clockwise around its own center.
- Second assignment: `box` scales to 1.2 times its size around its center. Each assignment replaces the previous transform rather than adding to it, so it is no longer rotated.
- Third assignment: `box` is scaled to 1.2 times and rotated 30°. This is what finally appears on screen.

A transform does not change the view's `bounds` or `center`. When the transform is not the identity, `frame` reads as the bounding rectangle after the transform; see [`UIView.transform`](ui-view/transform.md).

Fields with fractional values may differ in the last few digits when read back after the system's calculation. The acceptance tests compare round-tripped transform matrices only to 4 decimal places; digit-for-digit equality is **not verified in the simulator**. Allow a tolerance when comparing:

```js
const box = new UIView();
box.transform = CGAffineTransform.rotation(Math.PI / 6);
const t = box.transform;
console.log(Math.abs(t.a - Math.cos(Math.PI / 6)) < 0.0001);
```

**Result**: logs `true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `CGAffineTransformMake(a, b, c, d, tx, ty)` | `new CGAffineTransform(a, b, c, d, tx, ty)` |
| `CGAffineTransformIdentity` | `CGAffineTransform.identity` |
| `CGAffineTransformMakeScale(sx, sy)` | `CGAffineTransform.scale(sx, sy)` |
| `CGAffineTransformMakeTranslation(tx, ty)` | `CGAffineTransform.translation(tx, ty)` |
| `CGAffineTransformMakeRotation(r)` | `CGAffineTransform.rotation(r)` |
| `CGAffineTransformConcat(t1, t2)` | `t1.concat(t2)` |
| `CGAffineTransformInvert(t)` (returns `t` itself when not invertible) | `t.invert()` (returns `null` when not invertible) |
| `CGAffineTransformIsIdentity(t)` | `t.isIdentity` |

## See also

- [Structs](structs.md): rules shared by all structs
- [`UIView.transform`](ui-view/transform.md): how a transform affects `frame`
- [Units](units.md): pt, radians, and degrees
