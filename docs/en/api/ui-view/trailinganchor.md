---
type: reference
native: UIView.trailingAnchor
---

# `UIView`: `trailingAnchor` property

The **`trailingAnchor`** property is the view's trailing edge, used to build constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.trailingAnchor === view.trailingAnchor` is `true`.
- Anchors can't be constructed directly. An anchor keeps working even if your code holds only the anchor and not the view.
- An anchor can only build constraints with anchors of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).
- The opposite of `leadingAnchor`: the right edge in left-to-right languages.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.trailingAnchor.constraintEqualToAnchor(parent.trailingAnchor, { constant: -16 }).isActive = true;
```

**Effect**: The trailing edge of `box` sits 16 pt inside the trailing edge of `parent`. Rightward is positive, so the value is `-16`.

## Corresponding iOS API

`UIView.trailingAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
