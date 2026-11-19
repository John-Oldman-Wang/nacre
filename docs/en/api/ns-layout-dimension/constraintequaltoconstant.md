---
type: reference
native: "-[NSLayoutDimension constraintEqualToConstant:]"
---

# `NSLayoutDimension`: `constraintEqualToConstant()` method

The **`constraintEqualToConstant()`** method creates a constraint: this dimension equals a constant (this dimension = `value`).

## Syntax

```
constraintEqualToConstant(value)
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
const c = box.widthAnchor.constraintEqualToConstant(60);
c.isActive = true;
console.log(c.relation, c.constant, c.secondAnchor);
```

**Result**: `box` is 60 pt wide. The console prints `equal 60 null`.

## Corresponding iOS API

`-[NSLayoutDimension constraintEqualToConstant:]`.

## See also

- [`constraintGreaterThanOrEqualToConstant()`](constraintgreaterthanorequaltoconstant.md)
- [`constraintLessThanOrEqualToConstant()`](constraintlessthanorequaltoconstant.md)
- [`constraintEqualToAnchor()`](constraintequaltoanchor.md): comparing against another dimension
