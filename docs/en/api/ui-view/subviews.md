---
type: reference
native: UIView.subviews
---

# `UIView`: `subviews` property

The **`subviews`** property is all of the view's subviews, in drawing order; later ones are drawn on top.

## Value

A read-only array of `UIView`.

- Read-only; assigning to it throws `TypeError`.
- The default is an empty array.
- Each read returns a new array; changing the array doesn't affect the view. The view objects in it are the same objects, so you can compare them with `===`.
- The stacking order is determined only by this order; there is no separate z-index value.
- There is no change notification.

## Examples

```js
const card = new UIView();
const a = new UIView();
const b = new UIView();
card.addSubview(a);
card.addSubview(b);
console.log(card.subviews.length, card.subviews[1] === b);
```

**Result**: Logs `2 true`. `b` was added later, so it comes later and is drawn on top of `a`.

## Corresponding iOS API

`UIView.subviews`.

## See also

- [`superview`](superview.md)
- [`bringSubviewToFront()`](bringsubviewtofront.md), [`insertSubview()`](insertsubview.md)
- [The view hierarchy and stacking order](../ui-view.md#view-hierarchy-and-stacking-order)
