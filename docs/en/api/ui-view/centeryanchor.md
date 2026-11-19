---
type: reference
native: UIView.centerYAnchor
---

# `UIView`: `centerYAnchor` property

The **`centerYAnchor`** property is the view's vertical center line, used to build constraints.

## Value

An [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.centerYAnchor === view.centerYAnchor` is `true`.
- Anchors can't be constructed yourself. If your code holds only the anchor and not the view, the anchor still works.
- Constraints can only be built with an anchor of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.centerYAnchor.constraintEqualToAnchor(parent.centerYAnchor).isActive = true;
```

**Effect**: `box` is centered vertically in `parent`.

## Corresponding iOS API

`UIView.centerYAnchor`.

## See also

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
