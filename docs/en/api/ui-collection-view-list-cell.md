---
type: reference
native: UICollectionViewListCell
status: partial
---

# `UICollectionViewListCell`

**`UICollectionViewListCell`** represents the cell used in list layouts. It knows the list's appearance and can provide a content style that matches it: [`defaultContentConfiguration()`](ui-collection-view-list-cell/defaultcontentconfiguration.md). Row height, separators, and the pressed highlight are built in.

Register this class when using a list layout ([`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md)): `list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' })`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UICollectionReusableView`](ui-collection-reusable-view.md) → [`UICollectionViewCell`](ui-collection-view-cell.md) → `UICollectionViewListCell`

## Constructor

It can't be created with `new`; `new UICollectionViewListCell()` throws `TypeError`. Register it first with [`registerClass()`](ui-collection-view/registerclass.md), then get it inside `cellProvider`.

## Instance properties

All inherited from [`UICollectionViewCell`](ui-collection-view-cell.md): `contentView`, `contentConfiguration`, `isSelected`, `isHighlighted`.

## Instance methods

| Method | Description |
| --- | --- |
| [`defaultContentConfiguration()`](ui-collection-view-list-cell/defaultcontentconfiguration.md) | Gives a content configuration matching the list's appearance, with no content on it yet |

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });

const source = new UICollectionViewDiffableDataSource(list, {
  cellProvider(collectionView, indexPath, id) {
    const cell = collectionView.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath });
    const content = cell.defaultContentConfiguration();
    content.text = 'Order ' + id;
    content.secondaryText = 'Shipped';
    cell.contentConfiguration = content;
    return cell;
  },
});
```

**Effect**: each row shows "Order" plus the identifier on top, and "Shipped" in gray below.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[cell defaultContentConfiguration]` | `cell.defaultContentConfiguration()` |

## See also

- [`UICollectionViewCell`](ui-collection-view-cell.md)
- [`UIListContentConfiguration`](ui-list-content-configuration.md)
