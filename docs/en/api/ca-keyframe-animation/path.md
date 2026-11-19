---
type: reference
native: CAKeyframeAnimation.path
---

# `CAKeyframeAnimation`: `path` property

The **`path`** property is a path. When set, the layer moves along this path. Used for animations whose `keyPath` is `'position'`.

## Value

A [`UIBezierPath`](../ui-bezier-path.md), or `null`.

- Readable and writable.
- The default is `null`.
- When set, [`values`](values.md) has no effect.
- The path's coordinates are in the coordinate system of the layer's superlayer, the same as `position`. The unit is [pt](../units.md).
- It reads back as the object written. As with shape layers, the layer stores the path as of the moment of writing; changing the path afterward does not change the animation.
- Whether the layer turns to follow the direction of travel is decided by [`rotationMode`](rotationmode.md).
- To move along the path at a constant rate, set [`calculationMode`](calculationmode.md) to `'paced'`. Otherwise each segment of the path takes the same time, so the layer moves faster on longer segments.

## Examples

```js
const trail = new UIBezierPath();
trail.moveToPoint(new CGPoint(30, 130));
trail.addQuadCurveToPoint(new CGPoint(270, 130), { controlPoint: new CGPoint(150, 10) });

const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.path = trail;
walk.calculationMode = 'paced';
walk.duration = 2.4;
console.log(walk.path === trail);
```

**Effect**: The console prints `true`. After it is added to a layer, the layer moves from the bottom left to the bottom right along an upward arc, at a constant rate throughout.

## Corresponding iOS API

`CAKeyframeAnimation.path` (`CGPathRef`). Here you write a `UIBezierPath` directly, without taking `.CGPath`.

## See also

- [Moving along a path](../../guides/animation.md#moving-along-a-path)
- [`UIBezierPath`](../ui-bezier-path.md)
