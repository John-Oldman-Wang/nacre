---
type: reference
native: UILayoutGuide.layoutFrame
---

# `UILayoutGuide`: `layoutFrame` property

The **`layoutFrame`** property is this layout guide's rectangle as computed by layout, in the coordinate system of [`owningView`](owningview.md).

## Value

A [`CGRect`](../cg-rect.md), in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError`.
- Meaningful only after layout has run. To read it right after activating constraints, first call [`layoutIfNeeded()`](../ui-view/layoutifneeded.md) on a common ancestor.
- Each read returns a new `CGRect`.
- No event fires when it changes. When you need it, read it after `layoutIfNeeded()`.

## Examples

```js
const card = new UIView();
const left = new UIView();
const middle = new UIView();
for (const v of [left, middle]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  card.addSubview(v);
}
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);

NSLayoutConstraint.activateConstraints([
  left.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor),
  left.widthAnchor.constraintEqualToConstant(60),
  spacer.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor),
  spacer.widthAnchor.constraintEqualToConstant(8),
  middle.leadingAnchor.constraintEqualToAnchor(spacer.trailingAnchor),
  spacer.topAnchor.constraintEqualToAnchor(card.topAnchor),
  spacer.heightAnchor.constraintEqualToConstant(4),
]);
card.layoutIfNeeded();
console.log(spacer.layoutFrame.width, spacer.layoutFrame.height);
```

**Result**: logs `8 4`.

## Corresponding iOS API

`UILayoutGuide.layoutFrame`.

## See also

- [Using an invisible rectangle as a placeholder](../../guides/auto-layout.md#using-an-invisible-rectangle-as-a-placeholder)
