---
type: reference
native: UICollectionView.indexPathsForSelectedItems
---

# `UICollectionView`: `indexPathsForSelectedItems` property

The **`indexPathsForSelectedItems`** property is the positions of the selected items.

## Value

An array of [`NSIndexPath`](../ns-index-path.md).

- Read-only. Assigning to it throws `TypeError`.
- Defaults to an empty array.
- An empty array when nothing is selected.
- Each read returns a new array.
- No dedicated change event. Learn about selection changes from [`itemselect`](itemselect-event.md) and [`itemdeselect`](itemdeselect-event.md).

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.indexPathsForSelectedItems.length);
```

**Result**: prints `0` when nothing is selected.

## Corresponding iOS API

`UICollectionView.indexPathsForSelectedItems`.

## See also

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
