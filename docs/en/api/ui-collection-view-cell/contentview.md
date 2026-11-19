---
type: reference
native: UICollectionViewCell.contentView
---

# `UICollectionViewCell`: `contentView` property

The **`contentView`** property is where you put your own subviews in a cell.

## Value

A [`UIView`](../ui-view.md).

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object (measured).
- Add subviews to it, not directly to the cell. Verified by testing: subviews can be added to `contentView`.
- Cells are reused: create subviews only the first time the cell is used, and afterward change only the content. The same cell obtained again is the same JS object (measured), so you can use a `WeakMap` to remember its subviews.
- When [`contentConfiguration`](contentconfiguration.md) is written as `null`, `contentView` contains only the subviews you added.

## Examples

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  const badge = new UILabel();
  badge.text = 'NEW';
  badge.translatesAutoresizingMaskIntoConstraints = false;
  cell.contentView.addSubview(badge);
  badge.trailingAnchor.constraintEqualToAnchor(cell.contentView.trailingAnchor, { constant: -16 }).isActive = true;
  badge.centerYAnchor.constraintEqualToAnchor(cell.contentView.centerYAnchor).isActive = true;
}
```

**Effect**: after calling `inspect(cell)` on a cell, "NEW" appears on the right side of that row. How it looks on screen is **not verified in the simulator**.

## Corresponding iOS API

`UICollectionViewCell.contentView`.

## See also

- [Putting your own views in a cell](../../guides/lists.md#placing-your-own-views-in-a-cell)
