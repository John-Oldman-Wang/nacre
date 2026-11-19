---
type: reference
native: "-[UIView systemLayoutSizeFittingSize:]"
---

# `UIView`: `systemLayoutSizeFittingSize()` method

The **`systemLayoutSizeFittingSize()`** method computes the size closest to `size` from the constraints on this view and its descendants. It doesn't actually change the layout.

## Syntax

```
systemLayoutSizeFittingSize(size)
systemLayoutSizeFittingSize(size, { withHorizontalFittingPriority, verticalFittingPriority })
```

### Parameters

**`size`**

A [`CGSize`](../cg-size.md) or `{ width, height }`, in [pt](../units.md). Pass `new CGSize(0, 0)` to get the smallest size that satisfies the constraints.

**`options.withHorizontalFittingPriority`**, **`options.verticalFittingPriority`**

A number or a priority name (`'required'` (1000), `'defaultHigh'` (750), `'dragThatCanResizeScene'` (510), `'sceneSizeStayPut'` (500), `'dragThatCannotResizeScene'` (490), `'defaultLow'` (250), `'fittingSizeLevel'` (50)). Pass both together. `'required'` means that dimension must equal the value in `size` exactly; `'fittingSizeLevel'` means that dimension should be as small as possible. A common use is fixing the width and computing the height: `{ withHorizontalFittingPriority: 'required', verticalFittingPriority: 'fittingSizeLevel' }`. The version with priorities is **not verified in the simulator**.

### Return value

A `CGSize`, in pt.

### Exceptions

**`TypeError`**

- `size` isn't an object: `systemLayoutSizeFittingSize needs an object with all of: width, height`.
- `size` is missing a field, or a field isn't a finite number: `systemLayoutSizeFittingSize is missing width, or it is not a finite number`.
- Invalid priority name: `withHorizontalFittingPriority has no value "x"; expected one of: …`.

## Description

The difference from [`sizeThatFits()`](sizethatfits.md): `sizeThatFits()` asks how much space the view's own content needs, while this method computes from the constraints between subviews.

## Examples

```js
const card = new UIView();
const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
cardHeight.isActive = true;

const fitted = card.systemLayoutSizeFittingSize(new CGSize(0, 0));
console.log(fitted.height);
```

**Result**: Logs `60`, the value of the `cardHeight` constraint.

## Corresponding iOS API

`-[UIView systemLayoutSizeFittingSize:]` and `systemLayoutSizeFittingSize:withHorizontalFittingPriority:verticalFittingPriority:` are the same method in JS.

## See also

- [`sizeThatFits()`](sizethatfits.md)
