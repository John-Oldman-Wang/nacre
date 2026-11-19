---
type: reference
native: "-[UICollectionViewDiffableDataSource snapshot]"
---

# `UICollectionViewDiffableDataSource`: `snapshot()` method

The **`snapshot()`** method returns a copy of the list's current data.

## Syntax

```
snapshot()
```

### Parameters

None.

### Return value

An [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md). Changing it does not affect the list; after changing it, hand it to [`applySnapshot()`](applysnapshot.md).

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
const next = source.snapshot();
next.deleteItemsWithIdentifiers(['A1001']);
console.log(next.numberOfItems, source.snapshot().numberOfItems);
await source.applySnapshot(next);
```

**Result**: Prints `2 3`: the copy has one item fewer, while the list still has three. After the last line, the first row disappears with animation.

## Corresponding iOS API

`-[UICollectionViewDiffableDataSource snapshot]`.

## See also

- [`applySnapshot()`](applysnapshot.md)
