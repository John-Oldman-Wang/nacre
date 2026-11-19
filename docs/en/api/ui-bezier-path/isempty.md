---
type: reference
native: UIBezierPath.empty
---

# `UIBezierPath`: `isEmpty` property

The **`isEmpty`** property indicates whether the path contains nothing.

## Value

A boolean.

- Read-only; assigning to it throws `TypeError`.
- `true` for a new empty path.
- `true`: the path has no points. `false`: [`moveToPoint()`](movetopoint.md) has been called at least once, or the path is a ready-made shape created with a static method.
- It becomes `false` after [`moveToPoint()`](movetopoint.md) is called and goes back to `true` after [`removeAllPoints()`](removeallpoints.md). There is no change event: the path is changed only by code.

## Examples

```js
const path = new UIBezierPath();
console.log(path.isEmpty);
path.moveToPoint(new CGPoint(0, 0));
console.log(path.isEmpty);
```

**Result**: The console prints `true` and then `false`.

## Corresponding iOS API

`UIBezierPath.empty` (the ObjC getter is `isEmpty`).

## See also

- [`removeAllPoints()`](removeallpoints.md)
