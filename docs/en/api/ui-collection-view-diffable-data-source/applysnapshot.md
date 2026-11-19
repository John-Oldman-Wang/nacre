---
type: reference
native: "-[UICollectionViewDiffableDataSource applySnapshot:animatingDifferences:completion:]"
---

# `UICollectionViewDiffableDataSource`: `applySnapshot()` method

The **`applySnapshot()`** method makes the list show a snapshot. The system compares it with the current data and works out which rows to insert, delete, and move.

## Syntax

```
applySnapshot(snapshot)
applySnapshot(snapshot, { animatingDifferences })
```

### Parameters

**`snapshot`**

The snapshot to show, an [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md).

**`options.animatingDifferences`**

A boolean, optional. Defaults to `true`: differences are animated. Usually written `false` the first time data is put in.

### Return value

`Promise<void>`. Fulfills when the list has finished updating; with animation, when the animation ends. Measured: an animated update fulfills after about half a second.

By the time the call returns, `cellProvider` may already have been called.

### Exceptions

**`TypeError`**

`snapshot` is not a snapshot: `applySnapshot needs a NSDiffableDataSourceSnapshot`. In this case it throws directly instead of returning a Promise.

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
next.deleteItemsWithIdentifiers(['A1003']);
await source.applySnapshot(next);
list.scrollToItemAtIndexPath({ section: 0, item: 0 }, { atScrollPosition: ['top'] });
```

**Effect**: After the animation of the "A1003" row disappearing ends, the list scrolls back to the top.

## Corresponding iOS API

`-[UICollectionViewDiffableDataSource applySnapshot:animatingDifferences:completion:]`. `completion:` is replaced by the returned Promise.

## See also

- [`applySnapshotUsingReloadData()`](applysnapshotusingreloaddata.md)
- [`snapshot()`](snapshot.md)
