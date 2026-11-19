---
type: reference
native: "-[UIBezierPath containsPoint:]"
---

# `UIBezierPath`: `containsPoint()` method

The **`containsPoint()`** method tests whether a point is inside the path's fill area.

## Syntax

```
containsPoint(point)
```

### Parameters

**`point`**

The point to test, a `CGPoint`, in [pt](../units.md). Can also be a plain object `{ x, y }`. It must be in the same coordinate system as the path.

### Return value

A boolean. `true` if the point is within the area enclosed by the path, otherwise `false`.

### Exceptions

**`TypeError`**

- `point` isn't an object: `containsPoint needs an object with all of: x, y`.
- `x` or `y` is missing or can't be converted to a finite number: `containsPoint is missing x, or it is not a finite number`.

## Description

- It tests the fill area and ignores line width: a point on the stroke but outside the shape doesn't count. **Not verified in the simulator.**
- A path that isn't closed is tested as the closed shape. **Not verified in the simulator.**
- In self-intersecting or nested shapes, which regions count as inside is decided by [`usesEvenOddFillRule`](usesevenoddfillrule.md).
- Touch events give locations in the view's coordinate system. When the path is assigned to a layer whose `frame` origin isn't (0, 0), subtract the layer's origin first.

## Examples

```js
const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
console.log(box.containsPoint(new CGPoint(50, 50)));
console.log(box.containsPoint(new CGPoint(150, 50)));
```

**Result**: The console prints `true` and then `false`.

## Corresponding iOS API

`-[UIBezierPath containsPoint:]`.

## See also

- [`usesEvenOddFillRule`](usesevenoddfillrule.md): the rule used to decide what is inside
- [Finding which shape a tap landed on](../../guides/drawing-paths.md#determining-which-shape-a-tap-falls-on)
