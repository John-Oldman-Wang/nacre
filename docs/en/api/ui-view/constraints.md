---
type: reference
native: UIView.constraints
---

# `UIView`: `constraints` property

The **`constraints`** property is the constraints stored on this view.

## Value

A read-only array of [`NSLayoutConstraint`](../auto-layout.md).

- Read-only; assigning to it throws `TypeError`.
- It isn't the same as "the constraints that affect this view". On activation, the system stores a constraint on the nearest common ancestor of the views at its two ends: a constraint between two subviews is stored on their superview; a view's own width or height constraint (constrained to a constant) is stored on the view itself.
- To find all the constraints that affect this view, use [`constraintsAffectingLayoutForAxis()`](constraintsaffectinglayoutforaxis.md).

## Examples

```js
const card = new UIView();
const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
cardHeight.isActive = true;
console.log(card.constraints.includes(cardHeight));
```

**Result**: Prints `true`.

## Corresponding iOS API

`UIView.constraints`. The native `[view addConstraint:c]` and `[view removeConstraint:c]` have no corresponding JS methods; use the constraint's `isActive`.

## See also

- [Creating and activating are two steps](../auto-layout.md#creating-and-activating-are-two-steps)
