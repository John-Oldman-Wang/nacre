---
type: reference
native: UILayoutGuide.topAnchor
---

# `UILayoutGuide`: `topAnchor` property

The **`topAnchor`** property is the top edge of the layout guide, used to create constraints.

## Value

[`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it repeatedly on the same layout guide returns the same object.
- It means the same as the anchor of the same name on a view, [`UIView.topAnchor`](../ui-view/topanchor.md).
- The layout guide must first be added to a view with [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before its anchors can be used to create and activate constraints.

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
guide.topAnchor.constraintEqualToAnchor(card.topAnchor, { constant: 8 }).isActive = true;
```

**Effect**: creates and activates a constraint that determines the top edge of `guide`.

## Corresponding iOS API

`UILayoutGuide.topAnchor`.

## See also

- [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md): which constraints it can create
- [`UIView.topAnchor`](../ui-view/topanchor.md)
