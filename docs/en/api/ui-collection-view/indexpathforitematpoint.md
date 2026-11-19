---
type: reference
native: "-[UICollectionView indexPathForItemAtPoint:]"
---

# `UICollectionView`: `indexPathForItemAtPoint()` method

The **`indexPathForItemAtPoint()`** method returns which item a point in the list's coordinate system falls on.

## Syntax

```
indexPathForItemAtPoint(point)
```

### Parameters

**`point`**

A point, a [`CGPoint`](../structs.md) or `{ x, y }`, in [pt](../units.md), in the list's own coordinate system (including the scroll offset).

### Return value

An [`NSIndexPath`](../ns-index-path.md), or `null`. Returns `null` when the point doesn't fall on any item (verified by testing).

### Exceptions

**`TypeError`**

`point` isn't a point.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.indexPathForItemAtPoint({ x: -50, y: -50 }));
```

**Result**: prints `null`.

## Corresponding iOS API

`-[UICollectionView indexPathForItemAtPoint:]`.

## See also

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
