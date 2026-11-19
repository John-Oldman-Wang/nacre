---
type: reference
native: "-[UICollectionViewDiffableDataSource indexForSectionIdentifier:]"
---

# `UICollectionViewDiffableDataSource`: `indexForSectionIdentifier()` method

The **`indexForSectionIdentifier()`** method returns the index of a section. It looks up the list's current data, that is, the snapshot last handed to `applySnapshot()`.

## Syntax

```
indexForSectionIdentifier(sectionIdentifier)
```

### Parameters

**`sectionIdentifier`**

The section's identifier, a string or an integer.

### Return value

A number, counting from 0. Returns `-1` if there is no such section.

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
console.log(source.indexForSectionIdentifier('main'), source.indexForSectionIdentifier('nope'));
```

**Result**: Prints `0 -1`.

## Corresponding iOS API

`-[UICollectionViewDiffableDataSource indexForSectionIdentifier:]`. `NSNotFound` is replaced by -1.

## See also

- [Sections and items](../ui-collection-view.md#sections-and-items)
