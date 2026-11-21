---
type: reference
native: CALayer.doubleSided
---

# `CALayer`: `isDoubleSided` property

The **`isDoubleSided`** property determines whether the layer is still drawn when its [`transform`](transform.md) turns its back side toward the viewer.

## Value

A boolean.

- Readable and writable.
- Defaults to `true`.
- `true`: the back side is drawn as usual; you see the layer's content flipped horizontally or vertically.
- `false`: the layer isn't drawn while its back side faces the viewer. It is drawn as usual while its front side faces the viewer.
- The written value is converted by truthiness, so `'false'` is also `true`.
- How the two values look on screen is **not verified in the simulator**.

It only makes a difference once the layer is rotated more than 90° around the x or y axis. For a two-sided card, the front and back are each a layer; the back one is first rotated 180°, and both are set to `false`, so at any moment only the side facing the viewer is drawn.

## Examples

```js
const front = new CALayer();
front.frame = new CGRect(60, 160, 200, 120);
front.backgroundColor = 'systemBlue';
front.isDoubleSided = false;

const back = new CALayer();
back.frame = new CGRect(60, 160, 200, 120);
back.backgroundColor = 'systemOrange';
back.isDoubleSided = false;
back.transform = CATransform3D.rotation(Math.PI, 0, 1, 0);

console.log(front.isDoubleSided, back.isDoubleSided);
```

**Effect**

- The console prints `false false`.
- After both layers are added under the same superlayer, only the blue front is visible; rotate both layers another 180° around the y axis together, and only the orange back is visible. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`CALayer.doubleSided` (its ObjC getter is `isDoubleSided`).

## See also

- [`transform`](transform.md)
- [`CATransform3D.rotation()`](../ca-transform-3d/rotation.md)
