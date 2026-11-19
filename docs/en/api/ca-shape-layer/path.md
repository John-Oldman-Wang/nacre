---
type: reference
native: CAShapeLayer.path
---

# `CAShapeLayer`: `path` property

The **`path`** property is the path the shape layer draws.

## Value

A [`UIBezierPath`](../ui-bezier-path.md), or `null`.

- Readable and writable.
- Defaults to `null`, which draws nothing.
- Coordinates in the path are in the layer's own coordinate system, with the origin at the layer's top-left corner, in [pt](../units.md).
- The layer does not resize itself to fit the path. Parts of the path outside the layer's `frame` are drawn as usual, unless `masksToBounds` is `true`. **Not verified in the simulator.**
- Reading returns the same object that was written.
- **Modifying the path after writing it does not change the layer.** The layer stores the shape at the moment of writing. After changing the path, assign it again.

## Examples

```js
const path = new UIBezierPath();
path.moveToPoint(new CGPoint(0, 0));
path.addLineToPoint(new CGPoint(100, 0));

const shape = new CAShapeLayer();
shape.path = path;

path.addLineToPoint(new CGPoint(100, 100));   // the layer still shows one segment
shape.path = path;                            // now the layer shows two segments
console.log(shape.path === path);
```

**Effect**: only after the second assignment does the layer draw the newly added segment. **Not verified in the simulator.** The console logs `true`.

## Corresponding iOS API

`CAShapeLayer.path`. In ObjC you write `path.CGPath`; here you write the `UIBezierPath` directly.

## See also

- [`UIBezierPath`](../ui-bezier-path.md)
