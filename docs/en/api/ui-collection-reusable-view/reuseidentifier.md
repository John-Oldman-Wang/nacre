---
type: reference
native: UICollectionReusableView.reuseIdentifier
---

# `UICollectionReusableView`: `reuseIdentifier` property

The **`reuseIdentifier`** property is the reuse identifier used when this view was dequeued.

## Value

A string, or `null`.

- Read-only; assigning to it throws `TypeError`.
- For a cell, this is the reuse identifier given to `registerClass()` and `dequeueReusableCellWithReuseIdentifier()` (measured).

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
list.addEventListener('beforedisplay', (event) => {
  const cell = list.cellForItemAtIndexPath(event.indexPath);
  if (cell !== null) console.log(cell.reuseIdentifier);
});
```

**Effect**: logs `row` each time an item appears.

## Corresponding iOS API

`UICollectionReusableView.reuseIdentifier`.

## See also

- [`registerClass()`](../ui-collection-view/registerclass.md)
