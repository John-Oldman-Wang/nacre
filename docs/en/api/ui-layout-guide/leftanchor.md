---
type: reference
native: UILayoutGuide.leftAnchor
---

# `UILayoutGuide`: `leftAnchor` property

The **`leftAnchor`** property is the left edge of the layout guide, which doesn't change with writing direction, used to create constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it repeatedly on the same layout guide returns the same object.
- It means the same as the anchor of the same name on a view, [`UIView.leftAnchor`](../ui-view/leftanchor.md).
- The layout guide must first be added to a view with [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before its anchors can be used to create and activate constraints.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.leftAnchor.constraintEqualToAnchor(card.leftAnchor, { constant: 16 }).isActive = true;
```

**Effect**: creates and activates a constraint that determines the left edge of `guide`.

## Corresponding iOS API

`UILayoutGuide.leftAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can create
- [`UIView.leftAnchor`](../ui-view/leftanchor.md)
