---
type: reference
native: UILayoutGuide.trailingAnchor
---

# `UILayoutGuide`: `trailingAnchor` property

The **`trailingAnchor`** property is the trailing edge of the layout guide, opposite `leadingAnchor`, used to create constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it repeatedly on the same layout guide returns the same object.
- It means the same as the anchor of the same name on a view, [`UIView.trailingAnchor`](../ui-view/trailinganchor.md).
- The layout guide must first be added to a view with [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before its anchors can be used to create and activate constraints.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.trailingAnchor.constraintEqualToAnchor(card.trailingAnchor, { constant: 16 }).isActive = true;
```

**Effect**: creates and activates a constraint that determines the trailing edge of `guide`.

## Corresponding iOS API

`UILayoutGuide.trailingAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can create
- [`UIView.trailingAnchor`](../ui-view/trailinganchor.md)
