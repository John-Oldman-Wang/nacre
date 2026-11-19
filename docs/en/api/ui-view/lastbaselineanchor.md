---
type: reference
native: UIView.lastBaselineAnchor
---

# `UIView`: `lastBaselineAnchor` property

The **`lastBaselineAnchor`** property is the baseline of the view's last line of text, used to build constraints.

## Value

[`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.lastBaselineAnchor === view.lastBaselineAnchor` is `true`.
- Anchors can't be constructed directly. An anchor keeps working even if your code holds only the anchor and not the view.
- An anchor can only build constraints with anchors of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).
- The baseline is the line that the bottoms of the letters in a line of text sit on.

## Examples

```js
const parent = new UIView();
const box = new UILabel();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.lastBaselineAnchor.constraintEqualToAnchor(parent.bottomAnchor, { constant: -20 }).isActive = true;
```

**Effect**: The baseline of `box`'s last line of text sits 20 pt above the bottom edge of `parent`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.lastBaselineAnchor`.

## See also

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
