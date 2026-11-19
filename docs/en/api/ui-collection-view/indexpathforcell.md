---
type: reference
native: "-[UICollectionView indexPathForCell:]"
---

# `UICollectionView`: `indexPathForCell()` method

The **`indexPathForCell()`** method returns which item a cell is currently displaying.

## Syntax

```
indexPathForCell(cell)
```

### Parameters

**`cell`**

A cell, a [`UICollectionViewCell`](../ui-collection-view-cell.md).

### Return value

An [`NSIndexPath`](../ns-index-path.md), or `null`. Returns `null` when the cell isn't on screen.

### Exceptions

**`TypeError`**

`cell` isn't a cell (verified by testing).

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
  if (cell !== null) console.log(String(list.indexPathForCell(cell)));
});
```

**Effect**: when an item is about to appear, prints its position, such as `NSIndexPath(0, 0)`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UICollectionView indexPathForCell:]`.

## See also

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
