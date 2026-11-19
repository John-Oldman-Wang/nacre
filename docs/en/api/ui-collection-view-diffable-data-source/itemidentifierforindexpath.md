---
type: reference
native: "-[UICollectionViewDiffableDataSource itemIdentifierForIndexPath:]"
---

# `UICollectionViewDiffableDataSource`: `itemIdentifierForIndexPath()` method

The **`itemIdentifierForIndexPath()`** method returns which item is at a position. It looks up the list's current data, that is, the snapshot last handed to `applySnapshot()`.

## Syntax

```
itemIdentifierForIndexPath(indexPath)
```

### Parameters

**`indexPath`**

The position, an [`NSIndexPath`](../ns-index-path.md) or `{ section, item }`.

### Return value

An [identifier](../ui-collection-view.md#identifiers) (a string or an integer), or `null`. Returns `null` if there is no such position (verified by testing).

### Exceptions

None.

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
    content.text = String(id);
    cell.contentConfiguration = content;
    return cell;
  },
});
const first = new NSDiffableDataSourceSnapshot();
first.appendSectionsWithIdentifiers(['main']);
first.appendItemsWithIdentifiers(['A1001', 'A1002', 'A1003']);
await source.applySnapshot(first, { animatingDifferences: false });
console.log(source.itemIdentifierForIndexPath({ section: 0, item: 1 }), source.itemIdentifierForIndexPath({ section: 0, item: 400 }));
```

**Result**: Prints `A1002 null`.

## Corresponding iOS API

`-[UICollectionViewDiffableDataSource itemIdentifierForIndexPath:]`.

## See also

- [Sections and items](../ui-collection-view.md#sections-and-items)
