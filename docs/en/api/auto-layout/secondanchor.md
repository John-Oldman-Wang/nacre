---
type: reference
native: NSLayoutConstraint.secondAnchor
---

# `NSLayoutConstraint`: `secondAnchor` property

The **`secondAnchor`** property is the anchor on the right side of the constraint's equation.

## Value

An [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md), [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md), [`NSLayoutDimension`](../ns-layout-dimension.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- It's the same object as the `other` passed when the constraint was created.
- `null` for a constraint to a constant.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.topAnchor.constraintEqualToAnchor(parent.topAnchor);
console.log(c.secondAnchor === parent.topAnchor);
console.log(box.widthAnchor.constraintEqualToConstant(10).secondAnchor);
```

**Result**: Prints `true`, then `null`.

## Corresponding iOS API

`NSLayoutConstraint.secondAnchor`.

## See also

- [`firstAnchor`](firstanchor.md)
