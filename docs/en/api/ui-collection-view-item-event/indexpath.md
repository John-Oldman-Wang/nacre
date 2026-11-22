---
type: reference
native: UICollectionViewItemEvent.indexPath
---

# `UICollectionViewItemEvent`: `indexPath` property

The **`indexPath`** property is the position of the item at the moment the event happened.

## Value

An [`NSIndexPath`](../ns-index-path.md): which item in which section.

- Read-only. Assigning to it throws `TypeError`.
- The callback runs after the current round of code. If the data changed in the meantime, that position may now hold another item, or no item. First convert it to an identifier with [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md); a result of `null` means there is no item at that position anymore.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('itemselect', (e) => {
  console.log('第 ' + e.indexPath.section + ' 区第 ' + e.indexPath.item + ' 项');
  list.deselectItemAtIndexPath(e.indexPath, { animated: true });
});
```

**Effect**: tapping a row in the list prints its section and position, then deselects it.

## Corresponding iOS API

The `indexPath` parameter of the `collectionView:didSelectItemAtIndexPath:` family of delegate methods.

## See also

- [`UICollectionViewItemEvent`](../ui-collection-view-item-event.md)
