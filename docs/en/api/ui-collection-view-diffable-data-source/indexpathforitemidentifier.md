---
type: reference
native: "-[UICollectionViewDiffableDataSource indexPathForItemIdentifier:]"
---

# `UICollectionViewDiffableDataSource`: `indexPathForItemIdentifier()` method

The **`indexPathForItemIdentifier()`** method returns where an item currently is. It looks up the list's current data, that is, the snapshot last handed to `applySnapshot()`.

## Syntax

```
indexPathForItemIdentifier(itemIdentifier)
```

### Parameters

**`itemIdentifier`**

The item's identifier, a string or an integer.

### Return value

An [`NSIndexPath`](../ns-index-path.md), or `null`. Returns `null` if there is no such item (verified by testing).

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
console.log(String(source.indexPathForItemIdentifier('A1003')), source.indexPathForItemIdentifier('nope'));
```

**Result**: Prints `NSIndexPath(0, 2) null`.

## Corresponding iOS API

`-[UICollectionViewDiffableDataSource indexPathForItemIdentifier:]`.

## See also

- [Sections and items](../ui-collection-view.md#sections-and-items)
