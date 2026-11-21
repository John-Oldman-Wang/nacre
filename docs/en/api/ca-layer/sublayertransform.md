---
type: reference
native: CALayer.sublayerTransform
---

# `CALayer`: `sublayerTransform` property

The **`sublayerTransform`** property is the three-dimensional transform applied to all of this layer's sublayers. It doesn't change the layer itself, only how its sublayers are drawn.

## Value

A [`CATransform3D`](../ca-transform-3d.md).

- Readable and writable.
- The default is **not verified in the simulator**; according to Apple's documentation it is the identity matrix, meaning the sublayers get no extra transform.
- When writing, you can pass a `CATransform3D`, or a plain object with all 16 fields from `m11` to `m44`.
- Reading returns a new `CATransform3D` with read-only fields; see [Structs](../structs.md).
- Each sublayer applies its own [`transform`](transform.md) first, then the superlayer's `sublayerTransform`. **The on-screen effect is not verified in the simulator.**

The most common use is to give a group of sublayers a shared perspective: write `m34` on the superlayer's `sublayerTransform`, and put only the rotation in each sublayer's `transform`. The sublayers then look like they are in the same space, with consistent depth.

### Invalid values

**`TypeError`**

- The value is not an object: `sublayerTransform needs an object with all of: m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44`.
- A field is missing, or a field doesn't convert to a finite number: `sublayerTransform is missing m12, or it is not a finite number`, with the missing field name in the middle.

On error, the property keeps its previous value.

## Examples

```js
const stage = new CALayer();
stage.frame = new CGRect(20, 120, 320, 200);
stage.sublayerTransform = { ...CATransform3D.identity, m34: -1 / 500 };

const left = new CALayer();
left.frame = new CGRect(20, 40, 120, 120);
left.backgroundColor = 'systemBlue';
left.transform = CATransform3D.rotation(Math.PI / 4, 0, 1, 0);
stage.addSublayer(left);

const right = new CALayer();
right.frame = new CGRect(180, 40, 120, 120);
right.backgroundColor = 'systemOrange';
right.transform = CATransform3D.rotation(-Math.PI / 4, 0, 1, 0);
stage.addSublayer(right);

console.log(stage.sublayerTransform.m34);
```

**Effect**

- The console prints `-0.002`.
- The two squares each rotate 45° around their vertical center lines in opposite directions, sharing the same perspective. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`CALayer.sublayerTransform`.

## See also

- [`transform`](transform.md): the layer's own transform
- [Perspective](../ca-transform-3d.md#perspective)
- [`CATransform3D`](../ca-transform-3d.md)
