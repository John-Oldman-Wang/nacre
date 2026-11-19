---
type: reference
native: "-[UIBezierPath addQuadCurveToPoint:controlPoint:]"
---

# `UIBezierPath`: `addQuadCurveToPoint()` method

The **`addQuadCurveToPoint()`** method draws a quadratic Bézier curve from the [current point](currentpoint.md) to the given point. The curve's bend is determined by one control point; the curve itself doesn't pass through it.

## Syntax

```
addQuadCurveToPoint(point, { controlPoint })
```

### Parameters

**`point`**

The end of the curve, a `CGPoint`, in [pt](../units.md). Can also be a plain object `{ x, y }`.

**`options.controlPoint`**

The control point, a `CGPoint`, required. The curve heads toward it as it leaves the start point, and arrives at the end point from its direction.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `point` is invalid: `addQuadCurveToPoint needs an object with all of: x, y`, or `addQuadCurveToPoint is missing x, or it is not a finite number`.
- The control point is missing or invalid: `controlPoint needs an object with all of: x, y`.

## Examples

```js
const arch = new UIBezierPath();
arch.moveToPoint(new CGPoint(100, 50));
arch.addQuadCurveToPoint(new CGPoint(150, 50), {
  controlPoint: new CGPoint(125, 20),
});
console.log(String(arch.currentPoint));
```

**Result**: An upward-arching curve from (100, 50) to (150, 50). The console prints `CGPoint(150, 50)`.

## Corresponding iOS API

`-[UIBezierPath addQuadCurveToPoint:controlPoint:]`. The control point goes in the options object.

## See also

- [`addCurveToPoint()`](addcurvetopoint.md): a curve with two control points
