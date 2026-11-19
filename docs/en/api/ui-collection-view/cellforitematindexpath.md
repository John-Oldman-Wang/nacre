---
type: reference
native: "-[UICollectionView cellForItemAtIndexPath:]"
---

# `UICollectionView`: `cellForItemAtIndexPath()` method

The **`cellForItemAtIndexPath()`** method returns an item's current cell.

## Syntax

```
cellForItemAtIndexPath(indexPath)
```

### Parameters

**`indexPath`**

The item's position, an [`NSIndexPath`](../ns-index-path.md) or `{ section, item }`.

### Return value

A [`UICollectionViewCell`](../ui-collection-view-cell.md), or `null`.

- It's the very object `cellProvider` returned (verified by testing).
- Returns `null` when the item isn't on screen or doesn't exist (verified by testing).

### Exceptions

None.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.cellForItemAtIndexPath({ section: 0, item: 0 }));
```

**Result**: prints `null` when there's no data.

## Corresponding iOS API

`-[UICollectionView cellForItemAtIndexPath:]`.

## See also

- [`indexPathForCell()`](indexpathforcell.md)
