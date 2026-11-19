---
type: reference
native: "-[UIView hitTest:withEvent:]"
---

# `UIView`: `hitTest()` method

The **`hitTest()`** method finds the topmost view at `point` that can receive touches. The search covers the receiver itself and all of its descendants.

## Syntax

```
hitTest(point)
```

### Parameters

**`point`**

A [`CGPoint`](../cg-point.md) or `{ x, y }`, in the receiver's coordinate system, in [pt](../units.md).

### Return value

The `UIView` that was hit, or `null` if nothing was hit.

When the point falls on the receiver itself but not on any subview, the receiver itself is returned (measured).

### Exceptions

**`TypeError`**

`point` isn't an object or is missing fields. The rules are the same as for [structs](../structs.md#plain-objects-can-be-given-when-writing), and the message starts with `hitTest`.

## Description

- By iOS rules, hidden views, views whose `isUserInteractionEnabled` is `false`, and views with `alpha` below 0.01 aren't hit. **Not verified in the simulator.**
- Calling it fires no events and doesn't change any views.

## Examples

```js
const page = new UIView();
page.frame = new CGRect(0, 0, 390, 844);
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
page.addSubview(card);

const hit = page.hitTest(new CGPoint(50, 130));
if (hit) {
  console.log(hit === card);
}
```

**Result**: `(50, 130)` is inside `card`, so this prints `true`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView hitTest:withEvent:]`. The second ObjC parameter `withEvent:` doesn't exist here; write `view.hitTest(p)`.

## See also

- [`isUserInteractionEnabled`](isuserinteractionenabled.md)
