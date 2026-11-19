---
type: reference
native: NSLayoutXAxisAnchor
---

# `NSLayoutXAxisAnchor`

**`NSLayoutXAxisAnchor`** represents a horizontal position anchor: `leadingAnchor`, `trailingAnchor`, `leftAnchor`, `rightAnchor`, or `centerXAnchor` on a view or layout guide. It can only form constraints with another `NSLayoutXAxisAnchor`.

**Inheritance**: `EventTarget` → `NSObject` → [`NSLayoutAnchor`](ns-layout-anchor.md) → `NSLayoutXAxisAnchor`

## Constructor

Can't be created with `new`. Read it from the anchor properties of a view or a [`UILayoutGuide`](ui-layout-guide.md).

## Instance methods

Also inherits `constraintEqualToAnchor()`, `constraintGreaterThanOrEqualToAnchor()`, and `constraintLessThanOrEqualToAnchor()` from [`NSLayoutAnchor`](ns-layout-anchor.md).

Creating constraints with the system's standard spacing. Standard spacing is spacing defined by the system; its value is decided by the system based on what is at the two ends, and the actual value is **not verified in the simulator**:

| Method | The resulting constraint |
| --- | --- |
| [`constraintEqualToSystemSpacingAfterAnchor()`](ns-layout-x-axis-anchor/constraintequaltosystemspacingafteranchor.md) | This anchor is after `other`, at a distance = standard spacing × `multiplier` |
| [`constraintGreaterThanOrEqualToSystemSpacingAfterAnchor()`](ns-layout-x-axis-anchor/constraintgreaterthanorequaltosystemspacingafteranchor.md) | This anchor is after `other`, at a distance ≥ standard spacing × `multiplier` |
| [`constraintLessThanOrEqualToSystemSpacingAfterAnchor()`](ns-layout-x-axis-anchor/constraintlessthanorequaltosystemspacingafteranchor.md) | This anchor is after `other`, at a distance ≤ standard spacing × `multiplier` |

The distance between two anchors:

| Method | Description |
| --- | --- |
| [`anchorWithOffsetToAnchor()`](ns-layout-x-axis-anchor/anchorwithoffsettoanchor.md) | Returns an `NSLayoutDimension` that represents the distance from this anchor to `other` |

## Examples

```js
const parent = new UIView();
const left = new UIView();
const right = new UIView();
for (const v of [left, right]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const next = right.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(left.trailingAnchor);
next.isActive = true;
```

**Effect**: `right` comes after `left`, separated by the system's standard spacing. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[b.leadingAnchor constraintEqualToSystemSpacingAfterAnchor:a.trailingAnchor multiplier:1]` | `b.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(a.trailingAnchor)` |
| `[a.trailingAnchor anchorWithOffsetToAnchor:b.leadingAnchor]` | `a.trailingAnchor.anchorWithOffsetToAnchor(b.leadingAnchor)` |

## See also

- [`NSLayoutAnchor`](ns-layout-anchor.md): the methods shared by all three kinds of anchor, and which anchors can form constraints with each other
- [`NSLayoutConstraint`](auto-layout.md)
