---
type: reference
native: UICollectionViewCell
status: partial
---

# `UICollectionViewCell`

**`UICollectionViewCell`** represents a cell: the on-screen view for one item in a [`UICollectionView`](ui-collection-view.md).

Cells can't be created with `new`; they can only be obtained in the data source's `cellProvider` with [`dequeueReusableCellWithReuseIdentifier()`](ui-collection-view/dequeuereusablecellwithreuseidentifier.md). Cells are reused: after an item scrolls off screen, its cell is taken to display another item. So `cellProvider` must set all of the cell's content every time and can't assume the cell is new.

The content shown in a cell comes from two sources: the primary text, secondary text, and image given by [`contentConfiguration`](ui-collection-view-cell/contentconfiguration.md), and subviews the app adds to [`contentView`](ui-collection-view-cell/contentview.md) itself.

List layouts use its subclass [`UICollectionViewListCell`](ui-collection-view-list-cell.md), which adds a method that provides a default content style.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UICollectionReusableView`](ui-collection-reusable-view.md) → `UICollectionViewCell`

## Constructor

Can't be created with `new`; `new UICollectionViewCell()` throws `TypeError`. Register it first with [`registerClass()`](ui-collection-view/registerclass.md), then obtain it in `cellProvider`.

## Instance properties

Also inherits properties from [`UICollectionReusableView`](ui-collection-reusable-view.md) and [`UIView`](ui-view.md), such as `reuseIdentifier`.

| Property | Description |
| --- | --- |
| [`contentView`](ui-collection-view-cell/contentview.md) <small>read-only</small> | Where you put your own subviews |
| [`contentConfiguration`](ui-collection-view-cell/contentconfiguration.md) | The cell's content: primary text, secondary text, image |
| [`isSelected`](ui-collection-view-cell/isselected.md) | Whether this item is selected |
| [`isHighlighted`](ui-collection-view-cell/ishighlighted.md) | Whether a finger is currently pressing this item |

## Examples

### Putting your own label in a cell

Cells are reused, so create subviews only the first time a cell is used, and afterward change only the content.

```js
/** @type {WeakMap<UICollectionViewCell, UILabel>} */
const priceLabels = new WeakMap();

/** @param {UICollectionViewCell} cell */
function priceLabelOf(cell) {
  let label = priceLabels.get(cell);
  if (label === undefined) {
    label = new UILabel();
    label.translatesAutoresizingMaskIntoConstraints = false;
    cell.contentView.addSubview(label);
    NSLayoutConstraint.activateConstraints([
      label.trailingAnchor.constraintEqualToAnchor(cell.contentView.trailingAnchor, { constant: -16 }),
      label.centerYAnchor.constraintEqualToAnchor(cell.contentView.centerYAnchor),
    ]);
    priceLabels.set(cell, label);
  }
  return label;
}
```

**Effect**: after getting a cell in `cellProvider`, call `priceLabelOf(cell).text = '¥ 128'`, and each row gets a price on its right side. How it looks on screen is **not verified in the simulator**; verified by testing: subviews can be added to `contentView`, and the same cell obtained again is the same JS object.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `cell.contentView` | `cell.contentView` |
| `cell.contentConfiguration = content` | `cell.contentConfiguration = content` |
| `cell.selected` | `cell.isSelected` |
| `cell.highlighted` | `cell.isHighlighted` |

## See also

- [`UICollectionViewListCell`](ui-collection-view-list-cell.md)
- [`UIListContentConfiguration`](ui-list-content-configuration.md)
- [Registering and dequeuing cells](ui-collection-view.md#registering-and-dequeuing-cells)
- [Building a list](../guides/lists.md)
