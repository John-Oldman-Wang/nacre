---
type: reference
native: "-[NSLayoutYAxisAnchor constraintGreaterThanOrEqualToSystemSpacingBelowAnchor:multiplier:]"
---

# `NSLayoutYAxisAnchor`: `constraintGreaterThanOrEqualToSystemSpacingBelowAnchor()` method

The **`constraintGreaterThanOrEqualToSystemSpacingBelowAnchor()`** method creates a constraint: this anchor is below `other`, and the distance between them is greater than or equal to the system standard spacing multiplied by `multiplier`.

The standard spacing is a spacing defined by the system, not a specific number. The system decides its value, depending on what is at each end. The exact value is **not verified in the simulator**.

## Syntax

```
constraintGreaterThanOrEqualToSystemSpacingBelowAnchor(other[, { multiplier }])
```

### Parameters

**`other`**

Another `NSLayoutYAxisAnchor`.

**`options.multiplier`**

A number; a ratio with no unit. Optional; defaults to `1`.

### Return value

A new [`NSLayoutConstraint`](../auto-layout.md). **It is not active yet**; activate it with [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) or [`isActive`](../auto-layout/isactive.md) before it takes part in layout.

### Exceptions

**`TypeError`**

- `other` is a different kind of anchor, or not an anchor: same as [`constraintEqualToAnchor()`](../ns-layout-anchor/constraintequaltoanchor.md).
- `multiplier` can't be converted to a finite number: `multiplier must be a finite number, got "abc"`.

## Examples

```js
const parent = new UIView();
const a = new UIView();
const b = new UIView();
for (const v of [a, b]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const next = b.topAnchor.constraintGreaterThanOrEqualToSystemSpacingBelowAnchor(a.bottomAnchor);
next.isActive = true;
```

**Effect**: `b` sits below `a`, with at least the system standard spacing between them. **Not verified in the simulator.**

## Corresponding iOS API

`-[NSLayoutYAxisAnchor constraintGreaterThanOrEqualToSystemSpacingBelowAnchor:multiplier:]`. In ObjC `multiplier:` is required; here it can be omitted.

## See also

- [`constraintEqualToSystemSpacingBelowAnchor()`](constraintequaltosystemspacingbelowanchor.md)
- [`constraintLessThanOrEqualToSystemSpacingBelowAnchor()`](constraintlessthanorequaltosystemspacingbelowanchor.md)
- [`anchorWithOffsetToAnchor()`](anchorwithoffsettoanchor.md)
