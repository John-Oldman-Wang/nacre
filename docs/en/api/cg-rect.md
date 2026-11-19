---
type: reference
native: CGRect
---

# `CGRect`

**`CGRect`** represents a rectangle: the top-left position `x`, `y` plus the width `width` and height `height`, all in [pt](units.md). The coordinate origin is at the top left, and `y` increases downward.

The rectangle's numbers can be read directly (`r.x`, `r.width`) or in the nested form (`r.origin.x`, `r.size.width`); both read the same set of numbers.

Fields are read-only; to change one, replace the whole struct with a new one. Where a struct is accepted on write, a plain object with all fields also works. Each property read gives a new object. These rules hold for all structs; see [Structs](structs.md).

**Inheritance**: None. `CGRect` is an ordinary JS class; it doesn't inherit from `NSObject` and isn't an `EventTarget`.

## Constructor

[`CGRect()`](cg-rect/constructor.md)

Creates a rectangle from four numbers. Arguments not given are 0.

## Instance properties

| Property | Description |
| --- | --- |
| [`x`](cg-rect/x.md) <small>read-only</small> | Horizontal coordinate of the top-left corner, pt |
| [`y`](cg-rect/y.md) <small>read-only</small> | Vertical coordinate of the top-left corner, pt |
| [`width`](cg-rect/width.md) <small>read-only</small> | Width, pt |
| [`height`](cg-rect/height.md) <small>read-only</small> | Height, pt |
| [`origin`](cg-rect/origin.md) <small>read-only</small> | The top-left corner, a `CGPoint`. Each read gives a new one |
| [`size`](cg-rect/size.md) <small>read-only</small> | The size, a `CGSize`. Each read gives a new one |

Where a rectangle is accepted on write, a plain object is recognized only by the four direct fields `x`, `y`, `width`, and `height`. A shape like `{ origin, size }` isn't accepted and throws as "missing fields".

## Examples

```js
const r = new CGRect(10, 20, 100, 50);

console.log(r.x, r.y, r.width, r.height);
console.log(String(r.origin), String(r.size));
console.log(r.origin.x === r.x);
```

**Result**

- The first line prints `10 20 100 50`.
- The second line prints `CGPoint(10, 20) CGSize(100, 50)`.
- The third line prints `true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `CGRectMake(0, 0, 100, 50)` | `new CGRect(0, 0, 100, 50)` |
| `rect.origin.x` | `rect.origin.x` or `rect.x` |
| `rect.size.width` | `rect.size.width` or `rect.width` |
| `CGRectZero` | `new CGRect()` |

## See also

- [Structs](structs.md): rules shared by all structs, and converting to strings and JSON
- Where it is used: `frame` and `bounds` on [`UIView`](ui-view.md), `frame` and `bounds` on [`CALayer`](ca-layer.md), rectangle and oval paths on [`UIBezierPath`](ui-bezier-path.md), `scrollRectToVisible()` on [`UIScrollView`](ui-scroll-view.md)
- [`CGPoint`](cg-point.md), [`CGSize`](cg-size.md): the types of `origin` and `size`
