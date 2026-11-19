---
type: reference
native: UIBezierPath.bounds
---

# `UIBezierPath`: `bounds` property

The **`bounds`** property is the rectangle enclosing the whole path.

## Value

A `CGRect`, in [pt](../units.md).

- Read-only; assigning to it throws `TypeError`.
- `CGRect(0, 0, 0, 0)` for an empty path.
- It covers the path itself, not including line width. Line width is set on the shape layer; the path doesn't know about it.
- For a path with only straight lines, it is the rectangle that exactly encloses all vertices. For a path with Bézier curves, whether this rectangle also encloses the control points is **not verified in the simulator**.
- It changes as the path is changed; there is no change event: the path is changed only by code.

## Examples

```js
const line = new UIBezierPath();
line.moveToPoint(new CGPoint(0, 60));
line.addLineToPoint(new CGPoint(40, 20));
line.addLineToPoint(new CGPoint(80, 50));
console.log(String(line.bounds));
```

**Result**: The console prints `CGRect(0, 20, 80, 40)`.

## Corresponding iOS API

`UIBezierPath.bounds`.

## See also

- [Structs](../structs.md): `CGRect`
