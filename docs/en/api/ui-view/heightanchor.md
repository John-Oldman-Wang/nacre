---
type: reference
native: UIView.heightAnchor
---

# `UIView`: `heightAnchor` property

The **`heightAnchor`** property is the view's height, used to build constraints.

## Value

An [`NSLayoutDimension`](../ns-layout-dimension.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.heightAnchor === view.heightAnchor` is `true`.
- Anchors can't be constructed yourself. If your code holds only the anchor and not the view, the anchor still works.
- Constraints can only be built with an anchor of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).
- A dimension anchor can be compared with a constant and can also take a multiplier.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.heightAnchor.constraintEqualToAnchor(box.widthAnchor, { multiplier: 9 / 16 }).isActive = true;
```

**Effect**: The height of `box` is always 9/16 of its width. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.heightAnchor`.

## See also

- [`NSLayoutDimension`](../ns-layout-dimension.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
