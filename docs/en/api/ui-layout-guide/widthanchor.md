---
type: reference
native: UILayoutGuide.widthAnchor
---

# `UILayoutGuide`: `widthAnchor` property

The **`widthAnchor`** property is the width of the layout guide, used to create constraints.

## Value

[`NSLayoutDimension`](../ns-layout-dimension.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it repeatedly on the same layout guide returns the same object.
- It means the same as the anchor of the same name on a view, [`UIView.widthAnchor`](../ui-view/widthanchor.md).
- The layout guide must first be added to a view with [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before its anchors can be used to create and activate constraints.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.widthAnchor.constraintEqualToConstant(44).isActive = true;
```

**Effect**: creates and activates a constraint that determines the width of `guide`.

## Corresponding iOS API

`UILayoutGuide.widthAnchor`.

## See also

- [`NSLayoutDimension`](../ns-layout-dimension.md): which constraints it can create
- [`UIView.widthAnchor`](../ui-view/widthanchor.md)
