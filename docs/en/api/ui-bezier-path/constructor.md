---
type: reference
native: +[UIBezierPath bezierPath]
---

# `UIBezierPath()` constructor

The **`UIBezierPath()`** constructor creates an empty path. The path has no segments; add them afterward with [`moveToPoint()`](movetopoint.md) and the drawing methods.

Rectangles, ovals, rounded rectangles, and arcs have ready-made static methods; see [`UIBezierPath`](../ui-bezier-path.md#static-methods).

## Syntax

```
new UIBezierPath()
```

### Parameters

None.

### Return value

A new `UIBezierPath`. Its [`isEmpty`](isempty.md) is `true` and its [`currentPoint`](currentpoint.md) is `CGPoint(0, 0)`.

### Exceptions

None.

## Examples

```js
const path = new UIBezierPath();
console.log(path.isEmpty);
path.moveToPoint(new CGPoint(0, 60));
path.addLineToPoint(new CGPoint(40, 20));
console.log(path.isEmpty);
```

**Result**: The console prints `true` and then `false`.

## Corresponding iOS API

`[UIBezierPath bezierPath]`, or `[[UIBezierPath alloc] init]`.

## See also

- [`moveToPoint()`](movetopoint.md): start drawing the first segment
- [`UIBezierPath.bezierPathWithRect()`](bezierpathwithrect.md): get a rectangle directly
