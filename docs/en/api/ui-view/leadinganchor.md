---
type: reference
native: UIView.leadingAnchor
---

# `UIView`: `leadingAnchor` property

The **`leadingAnchor`** property is the view's leading edge, used to build constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.leadingAnchor === view.leadingAnchor` is `true`.
- Anchors can't be constructed directly. An anchor keeps working even if your code holds only the anchor and not the view.
- An anchor can only build constraints with anchors of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).
- It is the left edge in left-to-right languages and the right edge in right-to-left languages. Use it and `trailingAnchor` by default, and the interface mirrors automatically in right-to-left languages. The swap in right-to-left is **not verified in the simulator**.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.leadingAnchor.constraintEqualToAnchor(parent.leadingAnchor, { constant: 16 }).isActive = true;
```

**Effect**: The leading edge of `box` sits 16 pt inside the leading edge of `parent`.

## Corresponding iOS API

`UIView.leadingAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
