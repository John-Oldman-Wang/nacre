---
type: reference
native: NSLayoutDimension
---

# `NSLayoutDimension`

**`NSLayoutDimension`** represents a dimension anchor: the `widthAnchor` and `heightAnchor` of a view or layout guide, and the distance between two anchors returned by [`anchorWithOffsetToAnchor()`](ns-layout-x-axis-anchor/anchorwithoffsettoanchor.md).

Dimension anchors can do two things position anchors can't: compare against a constant ("width = 120 pt"), and take a multiplier ("width = parent's width × 0.5"). Width and height are the same type and can constrain each other.

**Inheritance**: `EventTarget` → `NSObject` → [`NSLayoutAnchor`](ns-layout-anchor.md) → `NSLayoutDimension`

## Constructor

It can't be created with `new`. Read it from `widthAnchor` or `heightAnchor` of a view or [`UILayoutGuide`](ui-layout-guide.md).

## Instance methods

Comparing against a constant:

| Method | Resulting constraint |
| --- | --- |
| [`constraintEqualToConstant()`](ns-layout-dimension/constraintequaltoconstant.md) | This dimension = `value` |
| [`constraintGreaterThanOrEqualToConstant()`](ns-layout-dimension/constraintgreaterthanorequaltoconstant.md) | This dimension ≥ `value` |
| [`constraintLessThanOrEqualToConstant()`](ns-layout-dimension/constraintlessthanorequaltoconstant.md) | This dimension ≤ `value` |

Comparing against another dimension, optionally with a multiplier. These three methods override the methods of the same names on [`NSLayoutAnchor`](ns-layout-anchor.md):

| Method | Resulting constraint |
| --- | --- |
| [`constraintEqualToAnchor()`](ns-layout-dimension/constraintequaltoanchor.md) | This dimension = `other` × `multiplier` + `constant` |
| [`constraintGreaterThanOrEqualToAnchor()`](ns-layout-dimension/constraintgreaterthanorequaltoanchor.md) | This dimension ≥ `other` × `multiplier` + `constant` |
| [`constraintLessThanOrEqualToAnchor()`](ns-layout-dimension/constraintlessthanorequaltoanchor.md) | This dimension ≤ `other` × `multiplier` + `constant` |

## Examples

```js
const parent = new UIView();
const cover = new UIView();
cover.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(cover);

NSLayoutConstraint.activateConstraints([
  cover.widthAnchor.constraintEqualToAnchor(parent.widthAnchor, { multiplier: 0.5 }),
  cover.heightAnchor.constraintEqualToAnchor(cover.widthAnchor, { multiplier: 9 / 16 }),
]);
```

**Effect**: `cover` is half as wide as `parent`, and its height is 9/16 of its width. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[v.widthAnchor constraintEqualToConstant:60]` | `v.widthAnchor.constraintEqualToConstant(60)` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5 })` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5 constant:-8]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5, constant: -8 })` |

## See also

- [`NSLayoutAnchor`](ns-layout-anchor.md)
- [`NSLayoutConstraint`](auto-layout.md)
- [Half the parent's width](../guides/auto-layout.md#half-the-superviews-width), [Keeping an aspect ratio](../guides/auto-layout.md#keeping-an-aspect-ratio)
