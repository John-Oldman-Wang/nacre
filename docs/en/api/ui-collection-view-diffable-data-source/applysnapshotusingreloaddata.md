---
type: reference
native: "-[UICollectionViewDiffableDataSource applySnapshotUsingReloadData:completion:]"
---

# `UICollectionViewDiffableDataSource`: `applySnapshotUsingReloadData()` method

The **`applySnapshotUsingReloadData()`** method makes the list show a snapshot without computing differences, reloading everything. Use it when the data is replaced wholesale and row-by-row animation is not needed.

## Syntax

```
applySnapshotUsingReloadData(snapshot)
```

### Parameters

**`snapshot`**

The snapshot to show, an [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md).

### Return value

`Promise<void>`. Fulfills when the list has finished updating.

### Exceptions

**`TypeError`**

`snapshot` is not a snapshot (for example, `null`): `applySnapshotUsingReloadData needs a NSDiffableDataSourceSnapshot`. In this case it throws directly instead of returning a Promise.

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
const fresh = new NSDiffableDataSourceSnapshot();
fresh.appendSectionsWithIdentifiers(['main']);
fresh.appendItemsWithIdentifiers(['B1', 'B2']);
await source.applySnapshotUsingReloadData(fresh);
```

**Effect**: The list shows the two new rows directly, with no insertion or deletion animation.

## Corresponding iOS API

`-[UICollectionViewDiffableDataSource applySnapshotUsingReloadData:completion:]`. `completion:` is replaced by the returned Promise.

## See also

- [`applySnapshot()`](applysnapshot.md)
