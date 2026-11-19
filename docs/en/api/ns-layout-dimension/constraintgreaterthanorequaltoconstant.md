---
type: reference
native: "-[NSLayoutDimension constraintGreaterThanOrEqualToConstant:]"
---

# `NSLayoutDimension`: `constraintGreaterThanOrEqualToConstant()` method

The **`constraintGreaterThanOrEqualToConstant()`** method creates a constraint: this dimension is greater than or equal to a constant (this dimension ≥ `value`).

## Syntax

```
constraintGreaterThanOrEqualToConstant(value)
```

### Parameters

**`value`**

A number, in [pt](../units.md). Converted with `Number()`.

### Return value

A new [`NSLayoutConstraint`](../auto-layout.md). **It isn't active yet**; it takes part in layout only after it's activated with [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) or [`isActive`](../auto-layout/isactive.md). The constraint's [`secondAnchor`](../auto-layout/secondanchor.md) is `null`, and its [`secondAttribute`](../auto-layout/secondattribute.md) is `'notAnAttribute'`.

### Exceptions

**`TypeError`**

`value` can't be converted to a finite number: `constant must be a finite number, got "abc"`.

## Examples

```js
const box = new UIView();
const c = box.widthAnchor.constraintGreaterThanOrEqualToConstant(100);
c.isActive = true;
console.log(c.relation, c.constant, c.secondAnchor);
```

**Result**: `box` is at least 100 pt wide. The console prints `greaterThanOrEqual 100 null`.

## Corresponding iOS API

`-[NSLayoutDimension constraintGreaterThanOrEqualToConstant:]`.

## See also

- [`constraintEqualToConstant()`](constraintequaltoconstant.md)
- [`constraintLessThanOrEqualToConstant()`](constraintlessthanorequaltoconstant.md)
- [`constraintGreaterThanOrEqualToAnchor()`](constraintgreaterthanorequaltoanchor.md): comparing against another dimension
