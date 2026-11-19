---
type: reference
native: UICollectionView.dataSource
---

# `UICollectionView`: `dataSource` property

The **`dataSource`** property is the data source attached to the list.

## Value

A [`UICollectionViewDiffableDataSource`](../ui-collection-view-diffable-data-source.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- `null` before a data source is attached.
- Attached automatically when the data source is created: after `new UICollectionViewDiffableDataSource(list, …)`, `list.dataSource` reads back as that data source.
- The list holds the data source, so the app doesn't need to keep a separate reference.

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
console.log(list.dataSource === source);
```

**Result**: prints `true`.

## Corresponding iOS API

`UICollectionView.dataSource`. In ObjC it's attached by assignment; here it's attached automatically when the data source is created.

## See also

- [`UICollectionViewDiffableDataSource()`](../ui-collection-view-diffable-data-source/constructor.md)
