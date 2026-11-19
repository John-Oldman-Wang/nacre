---
type: reference
native: UIView.topAnchor
---

# `UIView`: `topAnchor` property

The **`topAnchor`** property is the view's top edge, used to build constraints.

## Value

[`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.topAnchor === view.topAnchor` is `true`.
- Anchors can't be constructed directly. An anchor keeps working even if your code holds only the anchor and not the view.
- An anchor can only build constraints with anchors of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.topAnchor.constraintEqualToAnchor(parent.topAnchor, { constant: 12 }).isActive = true;
```

**Effect**: The top edge of `box` is 12 pt from the top edge of `parent`.

## Corresponding iOS API

`UIView.topAnchor`.

## See also

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
