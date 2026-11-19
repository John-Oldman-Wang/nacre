---
type: reference
native: "-[UIBezierPath closePath]"
---

# `UIBezierPath`: `closePath()` method

The **`closePath()`** method draws a straight line from the [current point](currentpoint.md) back to the start of this subpath, joining the subpath end to end.

## Syntax

```
closePath()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

Whether or not you call `closePath()`, the fill is the same, but the stroke differs:

- **Fill** is computed from the closed shape. A path that isn't closed still fills the complete shape.
- **Stroke** draws only the segments that actually exist. Without closing, the edge back to the start isn't drawn.

For shapes whose full outline should be stroked, call `closePath()` after drawing.

## Examples

```js
const triangle = new UIBezierPath();
triangle.moveToPoint(new CGPoint(50, 0));
triangle.addLineToPoint(new CGPoint(100, 80));
triangle.addLineToPoint(new CGPoint(0, 80));
triangle.closePath();
```

**Result**: A triangle. `closePath()` adds the third edge, from (0, 80) back to the start point (50, 0). **The effect of closing on stroke and fill is not verified in the simulator.**

## Corresponding iOS API

`-[UIBezierPath closePath]`.

## See also

- [`moveToPoint()`](movetopoint.md): where the subpath's start comes from
