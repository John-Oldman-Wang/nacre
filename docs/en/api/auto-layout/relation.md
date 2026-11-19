---
type: reference
native: NSLayoutConstraint.relation
---

# `NSLayoutConstraint`: `relation` property

The **`relation`** property is the relation in the constraint's equation: equal, greater than or equal, or less than or equal.

## Value

A string, one of these three:

| Value | Meaning |
| --- | --- |
| `'equal'` | Left side = right side |
| `'greaterThanOrEqual'` | Left side ≥ right side |
| `'lessThanOrEqual'` | Left side ≤ right side |

- Read-only; assigning to it throws `TypeError`.
- Determined by the method that created the constraint: `constraintEqualTo…` gives `'equal'`, `constraintGreaterThanOrEqualTo…` gives `'greaterThanOrEqual'`, and `constraintLessThanOrEqualTo…` gives `'lessThanOrEqual'`.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const minWidth = box.widthAnchor.constraintGreaterThanOrEqualToConstant(100);
console.log(minWidth.relation === 'greaterThanOrEqual');
```

**Result**: Prints `true`.

## Corresponding iOS API

`NSLayoutConstraint.relation`. `NSLayoutRelationEqual` becomes `'equal'`, and so on for the rest.

## See also

- [`firstAttribute`](firstattribute.md)
