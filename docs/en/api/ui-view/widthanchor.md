---
type: reference
native: UIView.widthAnchor
---

# `UIView`: `widthAnchor` property

The **`widthAnchor`** property is the view's width, used to build constraints.

## Value

[`NSLayoutDimension`](../ns-layout-dimension.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.widthAnchor === view.widthAnchor` is `true`.
- Anchors can't be constructed directly. An anchor keeps working even if your code holds only the anchor and not the view.
- An anchor can only build constraints with anchors of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).
- Dimension anchors can be compared with constants and can take a multiplier.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.widthAnchor.constraintEqualToConstant(120).isActive = true;
```

**Effect**: `box` is 120 pt wide.

## Corresponding iOS API

`UIView.widthAnchor`.

## See also

- [`NSLayoutDimension`](../ns-layout-dimension.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
