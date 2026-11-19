---
type: reference
native: UIBezierPath.currentPoint
---

# `UIBezierPath`: `currentPoint` property

The **`currentPoint`** property is the path's current point: the next segment is drawn from here.

## Value

A `CGPoint`, in [pt](../units.md).

- Read-only; assigning to it throws `TypeError`.
- `CGPoint(0, 0)` for an empty path.
- [`moveToPoint()`](movetopoint.md) sets it to the given point; the methods that draw lines, curves, and arcs set it to the end of that segment.
- It changes as the path is changed; there is no change event: the path is changed only by code.

## Examples

```js
const path = new UIBezierPath();
path.moveToPoint(new CGPoint(0, 60));
path.addLineToPoint(new CGPoint(40, 20));
console.log(String(path.currentPoint));
```

**Result**: The console prints `CGPoint(40, 20)`.

## Corresponding iOS API

`UIBezierPath.currentPoint`.

## See also

- [What a path is made of](../ui-bezier-path.md#what-a-path-is-made-of)
