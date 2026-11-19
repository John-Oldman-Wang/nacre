---
type: reference
native: "-[UICollectionView dequeueReusableCellWithReuseIdentifier:forIndexPath:]"
---

# `UICollectionView`: `dequeueReusableCellWithReuseIdentifier()` method

The **`dequeueReusableCellWithReuseIdentifier()`** method gets a cell inside the data source's `cellProvider` to display the item at `forIndexPath`. If a reusable cell is available you get it; otherwise a new one is created.

## Syntax

```
dequeueReusableCellWithReuseIdentifier(identifier, { forIndexPath })
```

### Parameters

**`identifier`**

The reuse identifier given at registration, a string.

**`options.forIndexPath`**

The item's position. Must be the `indexPath` that `cellProvider` received.

### Return value

A cell of the class given at registration. The type definitions treat it as [`UICollectionViewListCell`](../ui-collection-view-list-cell.md) by default; when the registered class is `UICollectionViewCell`, it has no `defaultContentConfiguration()`.

Cells are reused: the one you get may be new, or may still carry another item's content. So set all of its content every time.

### Exceptions

**`TypeError`**

- Called outside `cellProvider`: `dequeueReusableCellWithReuseIdentifier can only be called inside the cellProvider of this collection view's data source`
- The reuse identifier was never registered: `dequeueReusableCellWithReuseIdentifier: no cell class is registered for the reuse identifier "x"; call registerClass first`. This exception, thrown inside `cellProvider`, can be caught with `try` (verified by testing).
- A second cell is dequeued within one `cellProvider` call.
- `forIndexPath` isn't the position `cellProvider` received.

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
source.applySnapshot(first, { animatingDifferences: false });
```

**Effect**: the list shows three rows, each with its identifier as the primary text.

## Corresponding iOS API

`-[UICollectionView dequeueReusableCellWithReuseIdentifier:forIndexPath:]`. In ObjC, calling it outside `cellProvider` crashes the app; here it throws a `TypeError` you can `catch`.

## See also

- [`registerClass()`](registerclass.md)
- [`UICollectionViewDiffableDataSource()`](../ui-collection-view-diffable-data-source/constructor.md): `cellProvider`
