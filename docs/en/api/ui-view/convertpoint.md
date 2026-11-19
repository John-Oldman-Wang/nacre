---
type: reference
native: "-[UIView convertPoint:toView:]"
---

# `UIView`: `convertPoint()` method

The **`convertPoint()`** method converts a point from one view's coordinate system to another view's.

## Syntax

```
convertPoint(point, { toView })
convertPoint(point, { fromView })
```

### Parameters

**`point`**

A [`CGPoint`](../cg-point.md) or `{ x, y }`, in [pt](../units.md).

**`options.toView`**

A `UIView`, or `null`. `point` is in the receiver's coordinate system and is converted to the coordinate system of `toView`. `null` means the window's coordinate system.

**`options.fromView`**

A `UIView`, or `null`. `point` is in the coordinate system of `fromView` and is converted to the receiver's coordinate system. `null` means the window's coordinate system.

Give one of the two keys.

### Return value

The converted `CGPoint`.

### Exceptions

**`TypeError`**

- Neither key is in `options`: `convertPoint needs { toView } or { fromView }`.
- The first argument isn't an object or is missing fields: same rules as for [structs](../structs.md#plain-objects-can-be-given-when-writing), and the message starts with `convertPoint`.

## Examples

```js
const page = new UIView();
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
page.addSubview(card);
const dot = new UIView();
dot.frame = new CGRect(16, 16, 40, 40);
card.addSubview(dot);

const p = dot.convertPoint(new CGPoint(0, 0), { toView: page });
console.log(p.x, p.y);
const back = dot.convertPoint(new CGPoint(56, 136), { fromView: page });
console.log(back.x, back.y);
```

**Result**: Prints `56 136` (40 + 16 and 120 + 16), then `0 0`.

## Corresponding iOS API

`-[UIView convertPoint:toView:]` and `-[UIView convertPoint:fromView:]` are a single method in JS, with the second part written as an options key.

## See also

- [`convertRect()`](convertrect.md)
- [`frame`, `bounds`, and `center`](../ui-view.md#frame-bounds-and-center)
