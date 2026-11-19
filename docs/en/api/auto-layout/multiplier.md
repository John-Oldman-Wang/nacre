---
type: reference
native: NSLayoutConstraint.multiplier
---

# `NSLayoutConstraint`: `multiplier` property

The **`multiplier`** property is the multiplier in the constraint's equation (`firstAnchor = secondAnchor × multiplier + constant`).

## Value

A number: a ratio with no unit.

- Read-only; assigning to it throws `TypeError`. A constraint's multiplier can't change after it's created; to use a different multiplier, replace the constraint. See [Deactivating and replacing constraints](../../guides/auto-layout.md#deactivating-and-replacing-constraints).
- The value is the `multiplier` passed when the constraint was created, or `1` if none was passed. Only constraints between dimension anchors can have a multiplier.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const half = box.widthAnchor.constraintEqualToAnchor(parent.widthAnchor, { multiplier: 0.5 });
console.log(half.multiplier);
```

**Result**: Prints `0.5`.

## Corresponding iOS API

`NSLayoutConstraint.multiplier`.

## See also

- [`NSLayoutDimension.constraintEqualToAnchor()`](../ns-layout-dimension/constraintequaltoanchor.md)
