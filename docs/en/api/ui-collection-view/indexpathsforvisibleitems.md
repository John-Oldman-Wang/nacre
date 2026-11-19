---
type: reference
native: UICollectionView.indexPathsForVisibleItems
---

# `UICollectionView`: `indexPathsForVisibleItems` property

The **`indexPathsForVisibleItems`** property is the positions of the items currently on screen.

## Value

An array of [`NSIndexPath`](../ns-index-path.md).

- Read-only. Assigning to it throws `TypeError`.
- Defaults to an empty array.
- Has the same length as `visibleCells` (verified by testing). The order isn't guaranteed.
- Each read returns a new array.
- No dedicated change event. Learn which items are on screen from [`beforedisplay`](beforedisplay-event.md) and [`displayend`](displayend-event.md).

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.indexPathsForVisibleItems.length);
```

**Result**: prints `0` before the list is displayed.

## Corresponding iOS API

`UICollectionView.indexPathsForVisibleItems`.

## See also

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
