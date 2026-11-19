---
type: reference
native: UIView.leftAnchor
---

# `UIView`: `leftAnchor` property

The **`leftAnchor`** property is the view's left edge, used to build constraints.

## Value

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md).

- Read-only; assigning to it throws `TypeError`.
- Reading it repeatedly on the same view returns the same object: `view.leftAnchor === view.leftAnchor` is `true`.
- Anchors can't be constructed directly. An anchor keeps working even if your code holds only the anchor and not the view.
- An anchor can only build constraints with anchors of the same type. See [`NSLayoutAnchor`](../ns-layout-anchor.md).
- Always the left edge of the screen, regardless of writing direction. Use it only when the content really doesn't depend on writing direction. Don't mix it with `leading` / `trailing` in the same constraint.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

box.leftAnchor.constraintEqualToAnchor(parent.leftAnchor, { constant: 16 }).isActive = true;
```

**Effect**: The left edge of `box` is 16 pt from the left edge of `parent`, regardless of writing direction.

## Corresponding iOS API

`UIView.leftAnchor`.

## See also

- [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md): which constraints it can build
- [Laying out with constraints](../../guides/auto-layout.md)
