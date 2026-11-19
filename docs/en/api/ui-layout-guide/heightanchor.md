---
type: reference
native: UILayoutGuide.heightAnchor
---

# `UILayoutGuide`: `heightAnchor` property

The **`heightAnchor`** property is the height of the layout guide, used to create constraints.

## Value

[`NSLayoutDimension`](../ns-layout-dimension.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it repeatedly on the same layout guide returns the same object.
- It means the same as the anchor of the same name on a view, [`UIView.heightAnchor`](../ui-view/heightanchor.md).
- The layout guide must first be added to a view with [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before its anchors can be used to create and activate constraints.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.heightAnchor.constraintEqualToConstant(44).isActive = true;
```

**Effect**: creates and activates a constraint that determines the height of `guide`.

## Corresponding iOS API

`UILayoutGuide.heightAnchor`.

## See also

- [`NSLayoutDimension`](../ns-layout-dimension.md): which constraints it can create
- [`UIView.heightAnchor`](../ui-view/heightanchor.md)
