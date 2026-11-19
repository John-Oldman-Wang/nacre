---
type: reference
native: "-[UICollectionView selectItemAtIndexPath:animated:scrollPosition:]"
---

# `UICollectionView`: `selectItemAtIndexPath()` method

The **`selectItemAtIndexPath()`** method selects an item from code.

## Syntax

```
selectItemAtIndexPath(indexPath)
selectItemAtIndexPath(indexPath, { animated, scrollPosition })
```

### Parameters

**`indexPath`**

The item's position, an [`NSIndexPath`](../ns-index-path.md) or `{ section, item }`. Passing `null` deselects everything.

**`options.animated`**

A boolean, optional. Defaults to `false`.

**`options.scrollPosition`**

An array of strings, optional. Where to scroll the item after selecting it. Defaults to an empty array, meaning no scrolling.

| Value | Effect |
| --- | --- |
| `'top'` | The item's top edge aligns with the top edge of the visible area |
| `'centeredVertically'` | The item is vertically centered in the visible area |
| `'bottom'` | The item's bottom edge aligns with the bottom edge of the visible area |
| `'left'`, `'centeredHorizontally'`, `'right'` | For horizontally scrolling lists; same meanings as above |

At most one of the three vertical values, and at most one of the three horizontal values.

### Return value

None (`undefined`).

Doesn't fire [`itemselect`](itemselect-event.md) (verified by testing).

### Exceptions

**`TypeError`**

- There's no item at the position: `selectItemAtIndexPath: there is no item at section 0, item 99`
- `indexPath` isn't a position (for example, a string).
- `scrollPosition` contains an unrecognized name: `scrollPosition has no value "middle"; expected one of: …`

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
list.selectItemAtIndexPath({ section: 0, item: 1 }, { scrollPosition: ['centeredVertically'] });
console.log(list.indexPathsForSelectedItems.length);
```

**Effect**: the second row takes on the selected appearance and scrolls to the middle of the visible area. The console prints `1`.

## Corresponding iOS API

`-[UICollectionView selectItemAtIndexPath:animated:scrollPosition:]`. The `UICollectionViewScrollPosition` bitmask is written as an array of strings.

## See also

- [`deselectItemAtIndexPath()`](deselectitematindexpath.md)
