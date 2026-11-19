---
type: reference
native: "-[NSLayoutAnchor constraintLessThanOrEqualToAnchor:constant:]"
---

# `NSLayoutAnchor`: `constraintLessThanOrEqualToAnchor()` method

The **`constraintLessThanOrEqualToAnchor()`** method creates a constraint: this anchor is less than or equal to another anchor plus a constant (this anchor ≤ `other` + `constant`).

`NSLayoutXAxisAnchor`, `NSLayoutYAxisAnchor`, and `NSLayoutDimension` all have this method. The `NSLayoutDimension` version also accepts `multiplier`; see [`NSLayoutDimension.constraintLessThanOrEqualToAnchor()`](../ns-layout-dimension/constraintlessthanorequaltoanchor.md).

## Syntax

```
constraintLessThanOrEqualToAnchor(other[, { constant }])
```

### Parameters

**`other`**

Another anchor of the same type: horizontal positions connect only to horizontal positions, vertical positions only to vertical positions, and sizes only to sizes.

**`options.constant`**

A number, in [pt](../units.md). Optional; defaults to `0`. Positive is to the right horizontally and down vertically. Writing `{ constant: undefined }` is the same as omitting it. You can change the constraint's [`constant`](../auto-layout/constant.md) later.

### Return value

A new [`NSLayoutConstraint`](../auto-layout.md). **It is not yet active**; it takes part in layout only after being activated with [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) or [`isActive`](../auto-layout/isactive.md).

### Exceptions

**`TypeError`**

- `other` is an anchor of another type: `NSLayoutYAxisAnchor cannot be constrained to NSLayoutXAxisAnchor: their units are not compatible`, with the actual class names.
- `other` is not an anchor (including `null`): `constraintLessThanOrEqualToAnchor: needs an anchor as its argument`. It begins with the full native method name; when `constant` is given it is `constraintLessThanOrEqualToAnchor:constant:`.
- `constant` cannot be converted to a finite number: `constant must be a finite number, got "abc"`.

Type checking reports anchors of the wrong type in the editor.

## Examples

```js
const parent = new UIView();
const a = new UIView();
const b = new UIView();
for (const v of [a, b]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const c = b.topAnchor.constraintLessThanOrEqualToAnchor(a.bottomAnchor, { constant: 20 });
c.isActive = true;
console.log(c.relation, c.constant);
```

**Result**: `b`'s top edge is at most 20 pt below `a`'s bottom edge. The console logs `lessThanOrEqual 20`.

## Corresponding iOS API

`-[NSLayoutAnchor constraintLessThanOrEqualToAnchor:]` and `-[NSLayoutAnchor constraintLessThanOrEqualToAnchor:constant:]` are the same method in JS, with `constant:` written as an options key.

## See also

- [`constraintEqualToAnchor()`](constraintequaltoanchor.md)
- [`constraintGreaterThanOrEqualToAnchor()`](constraintgreaterthanorequaltoanchor.md)
- [A constraint is an equation](../auto-layout.md#a-constraint-is-an-equation)
