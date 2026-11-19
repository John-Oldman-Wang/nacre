---
type: reference
native: UIView.centerXAnchor
---

# `UIView`: `centerXAnchor` property

The **`centerXAnchor`** property is the view's horizontal center line, used to build constraints.

## Value

An [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.centerXAnchor === view.centerXAnchor` is `true`.
- Anchors can't be constructed yourself. If your code holds only the anchor and not the view, the anchor still works.
- Constraints can only be built with an anchor of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.centerXAnchor.constraintEqualToAnchor(parent.centerXAnchor).isActive = true;
```

**Effect**: `box` is centered horizontally in `parent`.

## Corresponding iOS API

`UIView.centerXAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
