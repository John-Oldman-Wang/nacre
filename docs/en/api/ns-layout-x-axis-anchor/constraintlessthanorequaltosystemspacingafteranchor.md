---
type: reference
native: "-[NSLayoutXAxisAnchor constraintLessThanOrEqualToSystemSpacingAfterAnchor:multiplier:]"
---

# `NSLayoutXAxisAnchor`: `constraintLessThanOrEqualToSystemSpacingAfterAnchor()` method

The **`constraintLessThanOrEqualToSystemSpacingAfterAnchor()`** method creates a constraint: this anchor is after `other` (to the right, in left-to-right languages), and the distance between them is less than or equal to the system's standard spacing times `multiplier`.

Standard spacing is spacing defined by the system, without a specific number written out. Its value is decided by the system and depends on what is at the two ends. The actual value is **not verified in the simulator**.

## Syntax

```
constraintLessThanOrEqualToSystemSpacingAfterAnchor(other[, { multiplier }])
```

### Parameters

**`other`**

Another `NSLayoutXAxisAnchor`.

**`options.multiplier`**

A number: a ratio with no unit. Optional; defaults to `1`.

### Return value

A new [`NSLayoutConstraint`](../auto-layout.md). **It isn't active yet**; it takes part in layout only after it's activated with [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) or [`isActive`](../auto-layout/isactive.md).

### Exceptions

**`TypeError`**

- `other` is a different kind of anchor, or not an anchor: same as [`constraintEqualToAnchor()`](../ns-layout-anchor/constraintequaltoanchor.md).
- `multiplier` doesn't convert to a finite number: `multiplier must be a finite number, got "abc"`.

## Examples

```js
const parent = new UIView();
const a = new UIView();
const b = new UIView();
for (const v of [a, b]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const next = b.leadingAnchor.constraintLessThanOrEqualToSystemSpacingAfterAnchor(a.trailingAnchor);
next.isActive = true;
```

**Effect**: `b` comes after `a` (to the right, in left-to-right languages), with at most the system's standard spacing between them. **Not verified in the simulator.**

## Corresponding iOS API

`-[NSLayoutXAxisAnchor constraintLessThanOrEqualToSystemSpacingAfterAnchor:multiplier:]`. In ObjC `multiplier:` is required; here it can be omitted.

## See also

- [`constraintEqualToSystemSpacingAfterAnchor()`](constraintequaltosystemspacingafteranchor.md)
- [`constraintGreaterThanOrEqualToSystemSpacingAfterAnchor()`](constraintgreaterthanorequaltosystemspacingafteranchor.md)
- [`anchorWithOffsetToAnchor()`](anchorwithoffsettoanchor.md)
