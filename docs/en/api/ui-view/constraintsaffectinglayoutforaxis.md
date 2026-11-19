---
type: reference
native: "-[UIView constraintsAffectingLayoutForAxis:]"
---

# `UIView`: `constraintsAffectingLayoutForAxis()` method

The **`constraintsAffectingLayoutForAxis()`** method returns all the constraints that actually affect this view along one axis, including those stored on ancestors.

## Syntax

```
constraintsAffectingLayoutForAxis(axis)
```

### Parameters

**`axis`**

`'horizontal'` or `'vertical'`.

### Return value

A read-only array of [`NSLayoutConstraint`](../auto-layout.md).

### Exceptions

**`TypeError`**

Invalid axis: `axis has no value "diagonal"; expected one of: horizontal / vertical`.

## Description

When constraints are insufficient or conflicting, the system prints nothing to the console (measured: nothing on standard output, standard error, or the system log). Check with [`hasAmbiguousLayout`](hasambiguouslayout.md), [`exerciseAmbiguityInLayout()`](exerciseambiguityinlayout.md), and [`constraintsAffectingLayoutForAxis()`](constraintsaffectinglayoutforaxis.md).

## Examples

```js
const page = new UIView();
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.addSubview(card);
const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
cardHeight.identifier = 'card-height';
NSLayoutConstraint.activateConstraints([
  cardHeight,
  card.topAnchor.constraintEqualToAnchor(page.topAnchor),
]);
page.layoutIfNeeded();

for (const c of card.constraintsAffectingLayoutForAxis('vertical')) {
  console.log(c.identifier, c.firstAttribute, c.relation, c.constant, c.priority);
}
```

**Result**: Each line prints one constraint that affects `card` vertically. One of the lines is `card-height height equal 60 1000`. The exact output of the loop is **not verified in the simulator**.

## Corresponding iOS API

`-[UIView constraintsAffectingLayoutForAxis:]`.

## See also

- [`identifier`](../auto-layout/identifier.md): give a constraint a name so you can recognize it in output
- [`constraints`](constraints.md)
