---
type: reference
native: "-[NSLayoutAnchor constraintEqualToAnchor:constant:]"
---

# `NSLayoutAnchor`: `constraintEqualToAnchor()` method

The **`constraintEqualToAnchor()`** method creates a constraint: this anchor is equal to another anchor plus a constant (this anchor = `other` + `constant`).

`NSLayoutXAxisAnchor`, `NSLayoutYAxisAnchor`, and `NSLayoutDimension` all have this method. The `NSLayoutDimension` version also accepts `multiplier`; see [`NSLayoutDimension.constraintEqualToAnchor()`](../ns-layout-dimension/constraintequaltoanchor.md).

## Syntax

```
constraintEqualToAnchor(other[, { constant }])
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
- `other` is not an anchor (including `null`): `constraintEqualToAnchor: needs an anchor as its argument`. It begins with the full native method name; when `constant` is given it is `constraintEqualToAnchor:constant:`.
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

const c = b.leadingAnchor.constraintEqualToAnchor(a.trailingAnchor, { constant: 8 });
c.isActive = true;
console.log(c.relation, c.constant);
```

**Result**: `b`'s left edge is 8 pt to the right of `a`'s right edge. The console logs `equal 8`.

## Corresponding iOS API

`-[NSLayoutAnchor constraintEqualToAnchor:]` and `-[NSLayoutAnchor constraintEqualToAnchor:constant:]` are the same method in JS, with `constant:` written as an options key.

## See also

- [`constraintGreaterThanOrEqualToAnchor()`](constraintgreaterthanorequaltoanchor.md)
- [`constraintLessThanOrEqualToAnchor()`](constraintlessthanorequaltoanchor.md)
- [A constraint is an equation](../auto-layout.md#a-constraint-is-an-equation)
