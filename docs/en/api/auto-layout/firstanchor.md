---
type: reference
native: NSLayoutConstraint.firstAnchor
---

# `NSLayoutConstraint`: `firstAnchor` property

The **`firstAnchor`** property is the anchor on the left side of the constraint's equation.

## Value

An [`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md), [`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md), or [`NSLayoutDimension`](../ns-layout-dimension.md).

- Read-only; assigning to it throws `TypeError`.
- It's the same object as the anchor whose method created the constraint, so you can compare them with `===`.
- Constraints have no `firstItem` or `secondItem`. To know which views are at the ends of a constraint, keep track of them yourself when you create it.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.topAnchor.constraintEqualToAnchor(parent.topAnchor);
console.log(c.firstAnchor === box.topAnchor);
```

**Result**: Prints `true`.

## Corresponding iOS API

`NSLayoutConstraint.firstAnchor`.

## See also

- [`secondAnchor`](secondanchor.md)
