---
type: reference
native: UIView.firstBaselineAnchor
---

# `UIView`: `firstBaselineAnchor` property

The **`firstBaselineAnchor`** property is the baseline of the view's first line of text, used to build constraints.

## Value

An [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.firstBaselineAnchor === view.firstBaselineAnchor` is `true`.
- Anchors can't be constructed yourself. If your code holds only the anchor and not the view, the anchor still works.
- Constraints can only be built with an anchor of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).
- The baseline is the line that the bottoms of the letters in a line of text sit on. When two labels with different font sizes sit side by side, aligning their baselines puts the bottoms of both texts on the same line.

## Examples

```js
const parent = new UIView();
const box = new UILabel();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.firstBaselineAnchor.constraintEqualToAnchor(parent.topAnchor, { constant: 30 }).isActive = true;
```

**Effect**: The baseline of the first line of text in `box` is 30 pt from the top edge of `parent`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.firstBaselineAnchor`.

## See also

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
