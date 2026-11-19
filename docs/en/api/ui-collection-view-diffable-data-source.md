---
type: reference
native: UICollectionViewDiffableDataSource
status: partial
---

# `UICollectionViewDiffableDataSource`

**`UICollectionViewDiffableDataSource`** represents a list's data source: it decides which items a [`UICollectionView`](ui-collection-view.md) shows and what each item looks like.

The data source does two things. First, it keeps the list's current data: a [snapshot](ns-diffable-data-source-snapshot.md) recording which sections and items there are. Second, when the system needs to show an item, it calls the `cellProvider` the app gave it to get that item's cell. The app changes the data by handing a new snapshot to [`applySnapshot()`](ui-collection-view-diffable-data-source/applysnapshot.md); the system compares the two snapshots and works out the insertions, deletions, and moves.

Once created, it is attached to the list, and `list.dataSource` reads as it. The list holds the data source, so the app does not need to keep a separate reference.

**Inheritance**: `EventTarget` → `NSObject` → `UICollectionViewDiffableDataSource`

For adding, removing, and changing rows with it, see the guide [Building a list](../guides/lists.md).

## Constructor

[`UICollectionViewDiffableDataSource()`](ui-collection-view-diffable-data-source/constructor.md)

Creates a data source, attaches it to a list, and supplies the `cellProvider`.

## Instance methods

Data:

| Method | Description |
| --- | --- |
| [`snapshot()`](ui-collection-view-diffable-data-source/snapshot.md) | A copy of the list's current data |
| [`applySnapshot()`](ui-collection-view-diffable-data-source/applysnapshot.md) | Makes the list show a snapshot, optionally animating the differences |
| [`applySnapshotUsingReloadData()`](ui-collection-view-diffable-data-source/applysnapshotusingreloaddata.md) | Makes the list show a snapshot, reloading everything |

Converting between positions and identifiers:

| Method | Description |
| --- | --- |
| [`itemIdentifierForIndexPath()`](ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) | Which item is at a position |
| [`indexPathForItemIdentifier()`](ui-collection-view-diffable-data-source/indexpathforitemidentifier.md) | Where an item currently is |
| [`sectionIdentifierForIndex()`](ui-collection-view-diffable-data-source/sectionidentifierforindex.md) | The identifier of the section at an index |
| [`indexForSectionIdentifier()`](ui-collection-view-diffable-data-source/indexforsectionidentifier.md) | The index of a section |

## `cellProvider` runs on the spot

When the system needs to show an item, it calls `cellProvider` and waits for it to return a cell. The interface does not move while it runs.

- Do only two things in it: get a cell and set its content. Do not make requests or do heavy computation in it.
- If it throws or does not return a cell, the app does not crash. The exception is reported through [the `error` event of `application`](application.md), and the item shows as blank.
- For the rules on getting cells, see [Registering and dequeuing cells](ui-collection-view.md#registering-and-dequeuing-cells).

## Examples

### Create a data source with three items

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });

const titles = new Map([['a', 'Apple'], ['b', 'Banana'], ['c', 'Cherry']]);
const source = new UICollectionViewDiffableDataSource(list, {
  cellProvider(collectionView, indexPath, id) {
    const cell = collectionView.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath });
    const content = cell.defaultContentConfiguration();
    content.text = titles.get(String(id)) ?? '';
    cell.contentConfiguration = content;
    return cell;
  },
});

const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['main']);
snapshot.appendItemsWithIdentifiers(['a', 'b', 'c']);
source.applySnapshot(snapshot, { animatingDifferences: false });
console.log(list.dataSource === source);
```

**Effect**: The list shows three rows, "Apple", "Banana", and "Cherry". The console prints `true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UICollectionViewDiffableDataSource alloc] initWithCollectionView:list cellProvider:^(…) { … }]` | `new UICollectionViewDiffableDataSource(list, { cellProvider(…) { … } })` |
| `[source applySnapshot:snapshot animatingDifferences:YES completion:^{ … }]` | `await source.applySnapshot(snapshot, { animatingDifferences: true })` |
| `[source applySnapshotUsingReloadData:snapshot completion:^{ … }]` | `await source.applySnapshotUsingReloadData(snapshot)` |
| `[source snapshot]` | `source.snapshot()` |

The `completion:` parameter is replaced by the returned Promise. `NSNotFound` is replaced by -1.

## See also

- [`UICollectionView`](ui-collection-view.md)
- [`NSDiffableDataSourceSnapshot`](ns-diffable-data-source-snapshot.md)
- [Building a list](../guides/lists.md)
