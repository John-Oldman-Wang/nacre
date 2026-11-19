---
type: reference
native: UILayoutGuide.leadingAnchor
---

# `UILayoutGuide`: `leadingAnchor` property

The **`leadingAnchor`** property is the leading edge of the layout guide (the left edge in left-to-right languages and the right edge in right-to-left languages), used to create constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it repeatedly on the same layout guide returns the same object.
- It means the same as the anchor of the same name on a view, [`UIView.leadingAnchor`](../ui-view/leadinganchor.md).
- The layout guide must first be added to a view with [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before its anchors can be used to create and activate constraints.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor, { constant: 16 }).isActive = true;
```

**Effect**: creates and activates a constraint that determines the leading edge of `guide`.

## Corresponding iOS API

`UILayoutGuide.leadingAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can create
- [`UIView.leadingAnchor`](../ui-view/leadinganchor.md)
