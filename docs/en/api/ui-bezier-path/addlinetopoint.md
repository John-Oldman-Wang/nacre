---
type: reference
native: "-[UIBezierPath addLineToPoint:]"
---

# `UIBezierPath`: `addLineToPoint()` method

The **`addLineToPoint()`** method draws a straight line from the [current point](currentpoint.md) to the given point, which becomes the new current point.

## Syntax

```
addLineToPoint(point)
```

### Parameters

**`point`**

The end of the line, a `CGPoint`, in [pt](../units.md). Can also be a plain object `{ x, y }`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `point` isn't an object: `addLineToPoint needs an object with all of: x, y`.
- `x` or `y` is missing or can't be converted to a finite number: `addLineToPoint is missing x, or it is not a finite number`.

## Description

Call [`moveToPoint()`](movetopoint.md) first to give a starting point before drawing lines. The result of calling `addLineToPoint()` directly on an empty path is **not verified in the simulator**.

## Examples

```js
const line = new UIBezierPath();
line.moveToPoint(new CGPoint(0, 60));
line.addLineToPoint(new CGPoint(40, 20));
line.addLineToPoint(new CGPoint(80, 50));
console.log(String(line.currentPoint), String(line.bounds));
```

**Result**: A polyline with two segments. The console prints `CGPoint(80, 50) CGRect(0, 20, 80, 40)`.

## Corresponding iOS API

`-[UIBezierPath addLineToPoint:]`.

## See also

- [`closePath()`](closepath.md): draw a straight line back to the start
- [`addCurveToPoint()`](addcurvetopoint.md): draw a curve
