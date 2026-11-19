---
type: reference
native: UICollectionView.visibleCells
---

# `UICollectionView`: `visibleCells` property

The **`visibleCells`** property is the cells currently on screen.

## Value

An array of [`UICollectionViewCell`](../ui-collection-view-cell.md).

- Read-only. Assigning to it throws `TypeError`.
- Defaults to an empty array.
- Each one is the very object `cellProvider` returned (verified by testing). The order isn't guaranteed.
- Each read returns a new array.
- No dedicated change event. Learn which items are on screen from [`beforedisplay`](beforedisplay-event.md) and [`displayend`](displayend-event.md).

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.visibleCells.length);
```

**Result**: prints `0` before the list is displayed.

## Corresponding iOS API

`UICollectionView.visibleCells`.

## See also

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
