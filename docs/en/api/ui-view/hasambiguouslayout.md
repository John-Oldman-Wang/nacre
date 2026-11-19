---
type: reference
native: UIView.hasAmbiguousLayout
---

# `UIView`: `hasAmbiguousLayout` property

The **`hasAmbiguousLayout`** property indicates whether this view has enough constraints: whether its position and size are uniquely determined by them.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Constraints are insufficient; this view's position or size has more than one possible result |
| `false` | The result is unique |

- Read-only; assigning to it throws `TypeError`.
- Call [`layoutIfNeeded()`](layoutifneeded.md) first, then read it.
- The acceptance tests assert that it is `false` when the result is unique; the `true` case is **not verified in the simulator**.

When constraints are insufficient or conflicting, the system prints nothing to the console (measured: nothing on standard output, standard error, or the system log). Check with [`hasAmbiguousLayout`](hasambiguouslayout.md), [`exerciseAmbiguityInLayout()`](exerciseambiguityinlayout.md), and [`constraintsAffectingLayoutForAxis()`](constraintsaffectinglayoutforaxis.md).

## Examples

```js
const page = new UIView();
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.addSubview(card);
NSLayoutConstraint.activateConstraints([
  card.leadingAnchor.constraintEqualToAnchor(page.leadingAnchor),
  card.topAnchor.constraintEqualToAnchor(page.topAnchor),
  card.widthAnchor.constraintEqualToConstant(100),
  card.heightAnchor.constraintEqualToConstant(60),
]);
page.layoutIfNeeded();
console.log(card.hasAmbiguousLayout);
```

**Result**: Prints `false`.

## Corresponding iOS API

`UIView.hasAmbiguousLayout`.

## See also

- [Insufficient and conflicting constraints](../auto-layout.md#missing-and-conflicting-constraints)
- [Checking whether constraints are sufficient](../../guides/auto-layout.md#checking-whether-there-are-enough-constraints)
