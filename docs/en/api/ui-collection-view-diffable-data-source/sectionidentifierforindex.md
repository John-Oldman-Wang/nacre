---
type: reference
native: "-[UICollectionViewDiffableDataSource sectionIdentifierForIndex:]"
---

# `UICollectionViewDiffableDataSource`: `sectionIdentifierForIndex()` method

The **`sectionIdentifierForIndex()`** method returns the identifier of the section at an index. It looks up the list's current data, that is, the snapshot last handed to `applySnapshot()`.

## Syntax

```
sectionIdentifierForIndex(index)
```

### Parameters

**`index`**

The section's index, an integer, counting from 0.

### Return value

The section's identifier, or `null`. Returns `null` if there is no such section (verified by testing).

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
console.log(source.sectionIdentifierForIndex(0), source.sectionIdentifierForIndex(5));
```

**Result**: Prints `main null`.

## Corresponding iOS API

`-[UICollectionViewDiffableDataSource sectionIdentifierForIndex:]`.

## See also

- [Sections and items](../ui-collection-view.md#sections-and-items)
