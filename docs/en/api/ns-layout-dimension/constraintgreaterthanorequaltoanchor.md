---
type: reference
native: "-[NSLayoutDimension constraintGreaterThanOrEqualToAnchor:multiplier:constant:]"
---

# `NSLayoutDimension`: `constraintGreaterThanOrEqualToAnchor()` method

The **`constraintGreaterThanOrEqualToAnchor()`** method creates a constraint: this dimension is greater than or equal to another dimension times a multiplier plus a constant (this dimension ≥ `other` × `multiplier` + `constant`).

It overrides the method of the same name on [`NSLayoutAnchor`](../ns-layout-anchor.md), adding `multiplier`.

## Syntax

```
constraintGreaterThanOrEqualToAnchor(other[, { multiplier, constant }])
```

### Parameters

**`other`**

Another `NSLayoutDimension`: a width or a height. Width and height are the same type and can constrain each other; a view's height can be constrained to its own width.

**`options.multiplier`**

A number, a ratio, unitless. Optional; defaults to `1`.

**`options.constant`**

A number, in [pt](../units.md). Optional; defaults to `0`.

Both can be given together: `{ multiplier: 0.5, constant: -8 }` means "half, minus 8 pt".

### Return value

A new [`NSLayoutConstraint`](../auto-layout.md). **It isn't active yet**; it takes part in layout only after it's activated with [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) or [`isActive`](../auto-layout/isactive.md).

### Exceptions

**`TypeError`**

- `other` isn't a dimension anchor: same as [`NSLayoutAnchor.constraintGreaterThanOrEqualToAnchor()`](../ns-layout-anchor/constraintgreaterthanorequaltoanchor.md).
- `multiplier` or `constant` can't be converted to a finite number: `multiplier must be a finite number, got "abc"` (or `constant …`).

## Examples

```js
const parent = new UIView();
const cover = new UIView();
cover.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(cover);

const ratio = cover.heightAnchor.constraintGreaterThanOrEqualToAnchor(cover.widthAnchor, { multiplier: 9 / 16 });
ratio.isActive = true;
console.log(ratio.multiplier);
```

**Effect**: `cover`'s height is greater than or equal to 9/16 of its width. The console prints `0.5625`. The on-screen effect of `multiplier` is **not verified in the simulator**.

## Corresponding iOS API

`-[NSLayoutDimension constraintGreaterThanOrEqualToAnchor:multiplier:]`, `-[NSLayoutDimension constraintGreaterThanOrEqualToAnchor:multiplier:constant:]`, and `-[NSLayoutAnchor constraintGreaterThanOrEqualToAnchor:constant:]` are the same method in JS; `multiplier:` and `constant:` become keys of the options object.

## See also

- [`constraintEqualToAnchor()`](constraintequaltoanchor.md)
- [`constraintLessThanOrEqualToAnchor()`](constraintlessthanorequaltoanchor.md)
- [`constraintGreaterThanOrEqualToConstant()`](constraintgreaterthanorequaltoconstant.md): comparing against a constant
