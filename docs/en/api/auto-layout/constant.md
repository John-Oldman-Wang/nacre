---
type: reference
native: NSLayoutConstraint.constant
---

# `NSLayoutConstraint`: `constant` property

The **`constant`** property is the constant term of the constraint's equation (`firstAnchor = secondAnchor × multiplier + constant`). It's the only number in a constraint you can change after creating it.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to the `constant` passed when the constraint was created, or `0` if none was passed. For a constraint to a constant (the [`constraintEqualToConstant()`](../ns-layout-dimension/constraintequaltoconstant.md) family), it's that constant.
- Positive is to the right horizontally and downward vertically.
- A change takes effect on the next layout pass. To read the new `frame` right away, call [`layoutIfNeeded()`](../ui-view/layoutifneeded.md) first. The change is instant, with no transition animation; to animate it, see the guide [Animating views](../../guides/view-animations.md).
- Accepts values that convert to a number; `'84'` and `84` have the same effect.
- There's no change notification. Only the app's own code changes it.

### Invalid values

Writing a value that doesn't convert to a finite number (`undefined`, `'abc'`, `NaN`) throws `TypeError: constant must be a finite number, got undefined`, ending with the value received. `constant` keeps its previous value.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const height = box.heightAnchor.constraintEqualToConstant(60);
height.isActive = true;
parent.layoutIfNeeded();

height.constant = 84;
parent.layoutIfNeeded();
console.log(box.frame.height);
```

**Result**: Prints `84`.

## Corresponding iOS API

`NSLayoutConstraint.constant`.

## See also

- [Expanding and collapsing](../../guides/auto-layout.md#changing-a-constraints-constant-later)
- [`multiplier`](multiplier.md): can't be changed after creation
