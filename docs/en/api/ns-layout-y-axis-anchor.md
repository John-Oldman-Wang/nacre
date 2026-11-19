---
type: reference
native: NSLayoutYAxisAnchor
---

# `NSLayoutYAxisAnchor`

**`NSLayoutYAxisAnchor`** represents a vertical position anchor: `topAnchor`, `bottomAnchor`, `centerYAnchor`, `firstBaselineAnchor`, and `lastBaselineAnchor` on a view or layout guide. It can only form constraints with another `NSLayoutYAxisAnchor`.

**Inheritance**: `EventTarget` → `NSObject` → [`NSLayoutAnchor`](ns-layout-anchor.md) → `NSLayoutYAxisAnchor`

## Constructor

Can't be created with `new`. Read it from an anchor property on a view or a [`UILayoutGuide`](ui-layout-guide.md).

## Instance methods

Also inherits `constraintEqualToAnchor()`, `constraintGreaterThanOrEqualToAnchor()`, and `constraintLessThanOrEqualToAnchor()` from [`NSLayoutAnchor`](ns-layout-anchor.md).

Creating constraints with the system standard spacing. The standard spacing is a spacing defined by the system; the system decides its value based on what is at each end. The exact value is **not verified in the simulator**:

| Method | Resulting constraint |
| --- | --- |
| [`constraintEqualToSystemSpacingBelowAnchor()`](ns-layout-y-axis-anchor/constraintequaltosystemspacingbelowanchor.md) | This anchor is below `other`, at a distance = standard spacing × `multiplier` |
| [`constraintGreaterThanOrEqualToSystemSpacingBelowAnchor()`](ns-layout-y-axis-anchor/constraintgreaterthanorequaltosystemspacingbelowanchor.md) | This anchor is below `other`, at a distance ≥ standard spacing × `multiplier` |
| [`constraintLessThanOrEqualToSystemSpacingBelowAnchor()`](ns-layout-y-axis-anchor/constraintlessthanorequaltosystemspacingbelowanchor.md) | This anchor is below `other`, at a distance ≤ standard spacing × `multiplier` |

The distance between two anchors:

| Method | Description |
| --- | --- |
| [`anchorWithOffsetToAnchor()`](ns-layout-y-axis-anchor/anchorwithoffsettoanchor.md) | Returns an `NSLayoutDimension` that represents the distance from this anchor to `other` |

## Examples

```js
const parent = new UIView();
const left = new UIView();
const right = new UIView();
for (const v of [left, right]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const next = right.topAnchor.constraintEqualToSystemSpacingBelowAnchor(left.bottomAnchor);
next.isActive = true;
```

**Effect**: `right` sits below `left`, separated by the system standard spacing. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[b.topAnchor constraintEqualToSystemSpacingBelowAnchor:a.bottomAnchor multiplier:1]` | `b.topAnchor.constraintEqualToSystemSpacingBelowAnchor(a.bottomAnchor)` |
| `[a.bottomAnchor anchorWithOffsetToAnchor:b.topAnchor]` | `a.bottomAnchor.anchorWithOffsetToAnchor(b.topAnchor)` |

## See also

- [`NSLayoutAnchor`](ns-layout-anchor.md): methods shared by all three kinds of anchor, and which anchors can form constraints with each other
- [`NSLayoutConstraint`](auto-layout.md)
