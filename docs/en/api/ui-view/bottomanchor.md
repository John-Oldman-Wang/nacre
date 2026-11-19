---
type: reference
native: UIView.bottomAnchor
---

# `UIView`: `bottomAnchor` property

The **`bottomAnchor`** property is the view's bottom edge, used to build constraints.

## Value

An [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.bottomAnchor === view.bottomAnchor` is `true`.
- Anchors can't be constructed yourself. If your code holds only the anchor and not the view, the anchor still works.
- Constraints can only be built with an anchor of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.bottomAnchor.constraintEqualToAnchor(parent.bottomAnchor, { constant: -24 }).isActive = true;
```

**Effect**: The bottom edge of `box` is 24 pt above the bottom edge of `parent`. Downward is positive, so you write `-24`.

## Corresponding iOS API

`UIView.bottomAnchor`.

## See also

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
