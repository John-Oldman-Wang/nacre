---
type: reference
native: "-[UIBezierPath addArcWithCenter:radius:startAngle:endAngle:clockwise:]"
---

# `UIBezierPath`: `addArcWithCenter()` method

The **`addArcWithCenter()`** method appends an arc to the path. If the path already has a [current point](currentpoint.md), it first draws a straight line from the current point to the start of the arc, then draws the arc. The end of the arc becomes the new current point.

## Syntax

```
addArcWithCenter(center, { radius, startAngle, endAngle, clockwise })
```

### Parameters

**`center`**

The center, a `CGPoint`, in [pt](../units.md). Can also be a plain object `{ x, y }`.

**`options.radius`**

The radius, a number, in pt. Required.

**`options.startAngle`**

The start angle, a number, in radians. 0 points straight right; see [Coordinates and angles](../ui-bezier-path.md#coordinates-and-angles). Required.

**`options.endAngle`**

The end angle, a number, in radians. Required.

**`options.clockwise`**

A boolean, required. `true` draws from the start angle to the end angle clockwise on screen; `false` draws counterclockwise.

None of the four options has a default.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- Any of the four options is missing: `addArcWithCenter needs { radius, startAngle, endAngle, clockwise }; missing radius` (`radius` replaced by whichever is actually missing).
- `radius`, `startAngle`, or `endAngle` can't be converted to a finite number.
- `center` is invalid: `addArcWithCenter needs an object with all of: x, y`.

## Examples

A pie slice: move to the center, append an arc, then close back to the center.

```js
const center = new CGPoint(60, 60);
const pie = new UIBezierPath();
pie.moveToPoint(center);
pie.addArcWithCenter(center, {
  radius: 50, startAngle: 0, endAngle: Math.PI / 2, clockwise: true,
});
pie.closePath();
```

**Result**: A quarter-circle pie slice centered at (60, 60), covering the lower-right quadrant.

## Corresponding iOS API

`-[UIBezierPath addArcWithCenter:radius:startAngle:endAngle:clockwise:]`. The four parameters other than the center go in the options object.

## See also

- [`UIBezierPath.bezierPathWithArcCenter()`](bezierpathwitharccenter.md): a new path with just one arc
- [`closePath()`](closepath.md)
