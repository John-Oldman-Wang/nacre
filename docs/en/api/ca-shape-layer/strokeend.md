---
type: reference
native: CAShapeLayer.strokeEnd
---

# `CAShapeLayer`: `strokeEnd` property

The **`strokeEnd`** property determines where along the path the stroke ends.

## Value

A number, a fraction from 0 to 1. 0 is the start of the path and 1 is the end.

- Readable and writable.
- Defaults to `1`.
- Change it for progress rings. If the layer has already been displayed, changing it plays a transition animation; see [Transition animations when changing properties](../ca-layer.md#transition-animations-when-changing-properties).
- Animating it makes the line draw itself bit by bit; see [`CABasicAnimation`](../ca-basic-animation.md).

### Invalid values

Written values are converted with `Number()`. Values that cannot be converted to a finite number throw `TypeError`.

## Examples

```js
const circle = UIBezierPath.bezierPathWithArcCenter(new CGPoint(150, 80), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});
const ring = new CAShapeLayer();
ring.path = circle;
ring.fillColor = null;
ring.strokeColor = 'systemGreen';
ring.lineWidth = 8;
ring.strokeEnd = 0.6;
```

**Effect**: a green ring with a radius of 40 pt, drawn 60% of the way clockwise starting from straight up. **Not verified in the simulator.**

## Corresponding iOS API

`CAShapeLayer.strokeEnd`.

## See also

- [`strokeStart`](strokestart.md)
