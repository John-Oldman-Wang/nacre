---
type: reference
native: UIView.superview
---

# `UIView`: `superview` property

The **`superview`** property is the view's parent view.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- The default is `null`. It is `null` when the view hasn't been added to any view.
- It reads back as the same object: a view in the view hierarchy doesn't need to be kept in a separate variable.
- There is no change notification.

## Examples

```js
const card = new UIView();
const dot = new UIView();
card.addSubview(dot);
console.log(dot.superview === card);
dot.removeFromSuperview();
console.log(dot.superview);
```

**Result**: Logs `true`, then `null`.

## Corresponding iOS API

`UIView.superview`.

## See also

- [`subviews`](subviews.md), [`addSubview()`](addsubview.md)
- [The view hierarchy and stacking order](../ui-view.md#view-hierarchy-and-stacking-order)
