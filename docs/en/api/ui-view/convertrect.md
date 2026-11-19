---
type: reference
native: "-[UIView convertRect:toView:]"
---

# `UIView`: `convertRect()` method

The **`convertRect()`** method converts a rectangle from one view's coordinate system to another view's.

## Syntax

```
convertRect(rect, { toView })
convertRect(rect, { fromView })
```

### Parameters

**`rect`**

A [`CGRect`](../cg-rect.md) or `{ x, y, width, height }`, in [pt](../units.md).

**`options.toView`**

A `UIView`, or `null`. `rect` is in the receiver's coordinate system and is converted to the coordinate system of `toView`. `null` means the window's coordinate system.

**`options.fromView`**

A `UIView`, or `null`. `rect` is in the coordinate system of `fromView` and is converted to the receiver's coordinate system. `null` means the window's coordinate system.

Give one of the two keys.

### Return value

The converted `CGRect`.

### Exceptions

**`TypeError`**

- Neither key is in `options`: `convertRect needs { toView } or { fromView }`.
- The first argument isn't an object or is missing fields: same rules as for [structs](../structs.md#plain-objects-can-be-given-when-writing), and the message starts with `convertRect`.

## Examples

```js
const page = new UIView();
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
page.addSubview(card);
const dot = new UIView();
dot.frame = new CGRect(16, 16, 40, 40);
card.addSubview(dot);

const r = dot.convertRect(dot.bounds, { toView: page });
console.log(String(r));
```

**Result**: Prints `CGRect(56, 136, 40, 40)`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView convertRect:toView:]` and `-[UIView convertRect:fromView:]` are a single method in JS, with the second part written as an options key.

## See also

- [`convertPoint()`](convertpoint.md)
- [`frame`, `bounds`, and `center`](../ui-view.md#frame-bounds-and-center)
