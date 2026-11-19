---
type: reference
native: UILayoutGuide.centerXAnchor
---

# `UILayoutGuide`: `centerXAnchor` property

The **`centerXAnchor`** property is the horizontal center line of the layout guide, used to create constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it repeatedly on the same layout guide returns the same object.
- It means the same as the anchor of the same name on a view, [`UIView.centerXAnchor`](../ui-view/centerxanchor.md).
- The layout guide must first be added to a view with [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before its anchors can be used to create and activate constraints.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.centerXAnchor.constraintEqualToAnchor(card.centerXAnchor, { constant: 16 }).isActive = true;
```

**Effect**: creates and activates a constraint that determines the horizontal center line of `guide`.

## Corresponding iOS API

`UILayoutGuide.centerXAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can create
- [`UIView.centerXAnchor`](../ui-view/centerxanchor.md)
