---
type: reference
native: UILayoutGuide.rightAnchor
---

# `UILayoutGuide`: `rightAnchor` property

The **`rightAnchor`** property is the right edge of the layout guide, which doesn't change with writing direction, used to create constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it repeatedly on the same layout guide returns the same object.
- It means the same as the anchor of the same name on a view, [`UIView.rightAnchor`](../ui-view/rightanchor.md).
- The layout guide must first be added to a view with [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before its anchors can be used to create and activate constraints.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.rightAnchor.constraintEqualToAnchor(card.rightAnchor, { constant: 16 }).isActive = true;
```

**Effect**: creates and activates a constraint that determines the right edge of `guide`.

## Corresponding iOS API

`UILayoutGuide.rightAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can create
- [`UIView.rightAnchor`](../ui-view/rightanchor.md)
