---
type: reference
native: CGPoint
---

# `CGPoint`

**`CGPoint`** represents a point on a plane: the x-coordinate `x` and the y-coordinate `y`, in [pt](units.md). The origin is at the top left; `x` increases to the right and `y` increases downward.

Its fields are read-only; to change one, replace the whole struct with a new one. Where a struct is accepted on write, you can also give a plain object with all the fields. Each read of a property returns a new object. These rules hold for all structs; see [Structs](structs.md).

**Inheritance**: None. `CGPoint` is a plain JS class; it doesn't inherit from `NSObject` and isn't an `EventTarget`.

## Constructor

[`CGPoint()`](cg-point/constructor.md)

Creates a point from an x-coordinate and a y-coordinate. Omitted arguments are 0.

## Instance properties

| Property | Description |
| --- | --- |
| [`x`](cg-point/x.md) <small>read-only</small> | The x-coordinate, in pt |
| [`y`](cg-point/y.md) <small>read-only</small> | The y-coordinate, in pt |

## Examples

```js
const view = new UIView();
view.frame = new CGRect(0, 0, 100, 100);
view.center = new CGPoint(200, 300);
console.log(String(view.center));
```

**Effect**: The view's center moves to (200, 300), and the console prints `CGPoint(200, 300)`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `CGPointMake(10, 20)` | `new CGPoint(10, 20)` |
| `CGPointZero` | `new CGPoint()` |

## See also

- [Structs](structs.md): the rules shared by all structs, and converting to strings and JSON
- Where it is used: `center` and `convertPoint()` on [`UIView`](ui-view.md), `contentOffset` on [`UIScrollView`](ui-scroll-view.md), and points on [`UIBezierPath`](ui-bezier-path.md)
- [`CGRect`](cg-rect.md): `origin` is a `CGPoint`
