---
type: reference
native: "+[UIBezierPath bezierPathWithArcCenter:radius:startAngle:endAngle:clockwise:]"
---

# `UIBezierPath.bezierPathWithArcCenter()` static method

The **`UIBezierPath.bezierPathWithArcCenter()`** static method creates an arc. For the direction of angles, see [Coordinates and angles](../ui-bezier-path.md#coordinates-and-angles).

## Syntax

```
UIBezierPath.bezierPathWithArcCenter(center, { radius, startAngle, endAngle, clockwise })
```

### Parameters

**`center`**

The center, a `CGPoint`, in [pt](../units.md). Can also be a plain object `{ x, y }`.

**`options.radius`**

The radius, a number, in pt. Required.

**`options.startAngle`**

The start angle, a number, in radians. 0 points straight right. Required.

**`options.endAngle`**

The end angle, a number, in radians. Required. For a full circle, make it `2 * Math.PI` larger than `startAngle`.

**`options.clockwise`**

A boolean, required. `true` draws from the start angle to the end angle clockwise on screen; `false` draws counterclockwise. With the same two angles, the two directions give two complementary arcs of the same circle. **How the two directions look on screen is not verified in the simulator.**

None of the four options has a default.

### Return value

A new `UIBezierPath`.

### Exceptions

**`TypeError`**

- Any of the four options is missing; the message says which: `bezierPathWithArcCenter needs { radius, startAngle, endAngle, clockwise }; missing startAngle`.
- `center` isn't an object: `bezierPathWithArcCenter needs an object with all of: x, y`.

## Examples

### A semicircle

```js
const arc = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true,
});
console.log(arc.bounds.width);
```

**Result**: A semicircular arc going clockwise from straight right, through straight down, to straight left. The console prints `100`.

### A full circle starting at the top

```js
const ring = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});
```

**Result**: A full circle with a radius of 40 pt, starting and ending at the top, going clockwise. For a progress ring, combine it with the shape layer's `strokeEnd` to draw only part of it.

## Corresponding iOS API

`+[UIBezierPath bezierPathWithArcCenter:radius:startAngle:endAngle:clockwise:]`. The four parameters other than the center go in the options object.

## See also

- [`addArcWithCenter()`](addarcwithcenter.md): append an arc to an existing path
- [Coordinates and angles](../ui-bezier-path.md#coordinates-and-angles)
