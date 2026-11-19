---
type: reference
native: UIView.layoutMarginsGuide
---

# `UIView`: `layoutMarginsGuide` property

The **`layoutMarginsGuide`** property is the area left after insetting each edge of the view by its [layout margins](directionallayoutmargins.md).

## Value

[`UILayoutGuide`](../ui-layout-guide.md).

- Read-only; assigning to it throws `TypeError`.
- Provided by the system. You don't add it with `addLayoutGuide()`, and it isn't in [`layoutGuides`](layoutguides.md).
- The margins default to 8 pt on each edge; change them with [`directionalLayoutMargins`](directionallayoutmargins.md).
- Subviews are inset by the margins only when they are aligned to it with constraints.
- The exact area is **not verified in the simulator**.

## Examples

```js
const card = new UIView();
card.directionalLayoutMargins = { top: 12, leading: 20, bottom: 12, trailing: 20 };

const caption = new UILabel();
caption.text = 'Caption';
caption.translatesAutoresizingMaskIntoConstraints = false;
card.addSubview(caption);

const margins = card.layoutMarginsGuide;
NSLayoutConstraint.activateConstraints([
  caption.topAnchor.constraintEqualToAnchor(margins.topAnchor),
  caption.leadingAnchor.constraintEqualToAnchor(margins.leadingAnchor),
]);
```

**Effect**: The text "Caption" appears in the top-left corner of `card`, 12 pt from its top edge and 20 pt from its left edge. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.layoutMarginsGuide`.

## See also

- [`UILayoutGuide`](../ui-layout-guide.md)
- [Laying out with constraints](../../guides/auto-layout.md)
