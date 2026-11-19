---
type: reference
native: UIView.rightAnchor
---

# `UIView`: `rightAnchor` property

The **`rightAnchor`** property is the view's right edge, used to build constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.rightAnchor === view.rightAnchor` is `true`.
- Anchors can't be constructed directly. An anchor keeps working even if your code holds only the anchor and not the view.
- An anchor can only build constraints with anchors of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).
- Always the right edge of the screen, regardless of writing direction. Don't mix it with `leading` / `trailing` in the same constraint.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.rightAnchor.constraintEqualToAnchor(parent.rightAnchor, { constant: -16 }).isActive = true;
```

**Effect**: The right edge of `box` is 16 pt from the right edge of `parent`, regardless of writing direction.

## Corresponding iOS API

`UIView.rightAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
