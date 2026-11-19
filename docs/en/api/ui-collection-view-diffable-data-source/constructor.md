---
type: reference
native: "-[UICollectionViewDiffableDataSource initWithCollectionView:cellProvider:]"
---

# `UICollectionViewDiffableDataSource()` constructor

The **`UICollectionViewDiffableDataSource()`** constructor creates a data source, attaches it to a list, and supplies the `cellProvider` the system calls when it needs to show an item.

## Syntax

```
new UICollectionViewDiffableDataSource(collectionView, { cellProvider })
```

### Parameters

**`collectionView`**

The list to attach to, a [`UICollectionView`](../ui-collection-view.md).

**`options.cellProvider`**

A function, required. The system calls it when it needs to show an item: `cellProvider(collectionView, indexPath, itemIdentifier)`. The three arguments are this list, the item's position (an [`NSIndexPath`](../ns-index-path.md)), and the item's [identifier](../ui-collection-view.md#identifiers). It must return a cell, obtained with [`dequeueReusableCellWithReuseIdentifier()`](../ui-collection-view/dequeuereusablecellwithreuseidentifier.md).

- It runs on the spot: the system waits for it to return, and the interface does not move while it runs. Only get a cell and set its content in it.
- It is called only for the rows that fit on screen, not for every item (verified by testing).
- If it throws, the app does not crash: the exception is reported through [the `error` event of `application`](../application.md), and the item shows as blank.
- If it returns something that is not a cell, the `error` event reports `TypeError: cellProvider must return a UICollectionViewCell, got undefined`, and the item shows as blank.

### Return value

The new data source, already attached to `collectionView`: `collectionView.dataSource` reads as it. The list holds the data source, so you do not need to keep a separate reference.

### Exceptions

**`TypeError`**

- The first argument is not a list: `UICollectionViewDiffableDataSource needs a UICollectionView`
- `cellProvider` is not a function, or no options were given: `UICollectionViewDiffableDataSource: cellProvider must be a function`

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

**Result**: Prints `true`.

## Corresponding iOS API

`-[UICollectionViewDiffableDataSource initWithCollectionView:cellProvider:]`. The ObjC block is written as a function in the options object.

## See also

- [Registering and dequeuing cells](../ui-collection-view.md#registering-and-dequeuing-cells)
