---
type: reference
native: "-[UIBezierPath addCurveToPoint:controlPoint1:controlPoint2:]"
---

# `UIBezierPath`: `addCurveToPoint()` method

The **`addCurveToPoint()`** method draws a cubic Bézier curve from the [current point](currentpoint.md) to the given point. The curve's bend is determined by two control points; the curve itself doesn't pass through them.

## Syntax

```
addCurveToPoint(point, { controlPoint1, controlPoint2 })
```

### Parameters

**`point`**

The end of the curve, a `CGPoint`, in [pt](../units.md). Can also be a plain object `{ x, y }`.

**`options.controlPoint1`**

The first control point, a `CGPoint`, required. The curve heads toward it as it leaves the start point.

**`options.controlPoint2`**

The second control point, a `CGPoint`, required. The curve arrives at the end point from its direction.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `point` is invalid: `addCurveToPoint needs an object with all of: x, y`, or `addCurveToPoint is missing x, or it is not a finite number`.
- A control point is missing or invalid: `controlPoint1 needs an object with all of: x, y` (likewise for `controlPoint2`).

## Examples

```js
const wave = new UIBezierPath();
wave.moveToPoint(new CGPoint(0, 50));
wave.addCurveToPoint(new CGPoint(100, 50), {
  controlPoint1: new CGPoint(30, 0),
  controlPoint2: new CGPoint(70, 100),
});
console.log(String(wave.currentPoint));
```

**Result**: An S-shaped curve from (0, 50) to (100, 50). The console prints `CGPoint(100, 50)`.

## Corresponding iOS API

`-[UIBezierPath addCurveToPoint:controlPoint1:controlPoint2:]`. The two control points go in the options object.

## See also

- [`addQuadCurveToPoint()`](addquadcurvetopoint.md): a curve with one control point
