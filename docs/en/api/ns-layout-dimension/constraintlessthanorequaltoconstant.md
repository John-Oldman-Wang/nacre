---
type: reference
native: "-[NSLayoutDimension constraintLessThanOrEqualToConstant:]"
---

# `NSLayoutDimension`: `constraintLessThanOrEqualToConstant()` method

The **`constraintLessThanOrEqualToConstant()`** method creates a constraint: this dimension is less than or equal to a constant (this dimension ≤ `value`).

## Syntax

```
constraintLessThanOrEqualToConstant(value)
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
const c = box.widthAnchor.constraintLessThanOrEqualToConstant(300);
c.isActive = true;
console.log(c.relation, c.constant, c.secondAnchor);
```

**Result**: `box` is at most 300 pt wide. The console prints `lessThanOrEqual 300 null`.

## Corresponding iOS API

`-[NSLayoutDimension constraintLessThanOrEqualToConstant:]`.

## See also

- [`constraintEqualToConstant()`](constraintequaltoconstant.md)
- [`constraintGreaterThanOrEqualToConstant()`](constraintgreaterthanorequaltoconstant.md)
- [`constraintLessThanOrEqualToAnchor()`](constraintlessthanorequaltoanchor.md): comparing against another dimension
