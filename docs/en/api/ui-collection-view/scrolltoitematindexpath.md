---
type: reference
native: "-[UICollectionView scrollToItemAtIndexPath:atScrollPosition:animated:]"
---

# `UICollectionView`: `scrollToItemAtIndexPath()` method

The **`scrollToItemAtIndexPath()`** method scrolls the list so that an item stops at a given position in the visible area.

## Syntax

```
scrollToItemAtIndexPath(indexPath, { atScrollPosition })
scrollToItemAtIndexPath(indexPath, { atScrollPosition, animated })
```

### Parameters

**`indexPath`**

The item's position, an [`NSIndexPath`](../ns-index-path.md) or `{ section, item }`.

**`options.atScrollPosition`**

An array of strings, required. Where the item stops:

| Value | Effect |
| --- | --- |
| `'top'` | The item's top edge aligns with the top edge of the visible area |
| `'centeredVertically'` | The item is vertically centered in the visible area |
| `'bottom'` | The item's bottom edge aligns with the bottom edge of the visible area |
| `'left'`, `'centeredHorizontally'`, `'right'` | For horizontally scrolling lists; same meanings as above |

At most one of the three vertical values, and at most one of the three horizontal values.

**`options.animated`**

A boolean, optional. Defaults to `false`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- There's no item at the position: `scrollToItemAtIndexPath: there is no item at section 1, item 99`
- `atScrollPosition` wasn't given: `scrollToItemAtIndexPath needs { atScrollPosition }`
- The scroll position contains an unrecognized name: `atScrollPosition has no value "middle"; expected one of: …`

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
const where = source.indexPathForItemIdentifier('A1003');
if (where !== null) {
  list.scrollToItemAtIndexPath(where, { atScrollPosition: ['centeredVertically'], animated: true });
}
```

**Effect**: the list scrolls so that the "A1003" row stops in the middle of the visible area.

## Corresponding iOS API

`-[UICollectionView scrollToItemAtIndexPath:atScrollPosition:animated:]`. `UICollectionViewScrollPositionTop` is written as `['top']`.

## See also

- [`indexPathForItemIdentifier()` of `UICollectionViewDiffableDataSource`](../ui-collection-view-diffable-data-source/indexpathforitemidentifier.md)
