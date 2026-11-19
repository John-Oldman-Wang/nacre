---
type: reference
native: CAMediaTimingFunction
status: partial
---

# `CAMediaTimingFunction`

**`CAMediaTimingFunction`** represents a timing function. A timing function decides how an animation's progress is distributed over time: constant speed, or slow and then fast. Assign it to an animation's [`timingFunction`](ca-animation/timingfunction.md), or to a transaction's [`setAnimationTimingFunction()`](ca-transaction/setanimationtimingfunction.md).

**Inheritance**: `EventTarget` → `NSObject` → `CAMediaTimingFunction`

## Constructor

Can't be created with `new`. Get one with the two static methods below.

## Static methods

[`CAMediaTimingFunction.functionWithName()`](ca-media-timing-function/functionwithname.md)

Gets one of the five built-in timing functions by name.

[`CAMediaTimingFunction.functionWithControlPoints()`](ca-media-timing-function/functionwithcontrolpoints.md)

Creates a custom timing function from the coordinates of two control points.

## Instance methods

| Method | Description |
| --- | --- |
| [`controlPointAtIndex()`](ca-media-timing-function/controlpointatindex.md) | Reads the curve's end points and control points |

## The shape of the curve

The curve is drawn in a square with sides of length 1. The horizontal axis is the fraction of time: 0 is the start of the animation and 1 is the end. The vertical axis is the fraction of progress: 0 is the from value and 1 is the to value. The curve is a cubic Bézier curve from (0, 0) to (1, 1), shaped by the two control points in between. Where the curve is steep, the property changes quickly; where it is flat, it changes slowly.

When an animation's `timingFunction` is `null`, it runs at constant speed.

## Examples

```js
const ease = CAMediaTimingFunction.functionWithName('easeInEaseOut');
console.log(String(ease.controlPointAtIndex(1)), String(ease.controlPointAtIndex(2)));
```

**Result**: The console prints the two control points, approximately `CGPoint(0.42, 0)` and `CGPoint(0.58, 1)`. The values are single-precision floats and print with error in the last digits.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn]` | `CAMediaTimingFunction.functionWithName('easeIn')` |
| `[CAMediaTimingFunction functionWithControlPoints:a :b :c :d]` | `CAMediaTimingFunction.functionWithControlPoints(a, b, c, d)` |
| `[fn getControlPointAtIndex:1 values:v]` | `fn.controlPointAtIndex(1)` |

## See also

- [Changing the speed curve](../guides/animation.md#changing-the-speed-curve)
- [`CAAnimation.timingFunction`](ca-animation/timingfunction.md)
