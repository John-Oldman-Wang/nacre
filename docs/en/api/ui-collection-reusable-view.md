---
type: reference
native: UICollectionReusableView
---

# `UICollectionReusableView`

**`UICollectionReusableView`** represents a reusable view in a [`UICollectionView`](ui-collection-view.md). It is the base class of the cell class [`UICollectionViewCell`](ui-collection-view-cell.md).

Reusable means that after an item scrolls off screen, its view isn't destroyed but kept to display another item. The collection view uses reuse identifiers to tell different kinds of views apart.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UICollectionReusableView`

## Constructor

Can't be created with `new`; `new UICollectionReusableView()` throws `TypeError`. Cells are obtained in the data source's `cellProvider` with [`dequeueReusableCellWithReuseIdentifier()`](ui-collection-view/dequeuereusablecellwithreuseidentifier.md).

## Instance properties

Also inherits properties from [`UIView`](ui-view.md).

| Property | Description |
| --- | --- |
| [`reuseIdentifier`](ui-collection-reusable-view/reuseidentifier.md) <small>read-only</small> | The reuse identifier used when it was dequeued |

## Corresponding iOS API

`UICollectionReusableView`. In ObjC, section header and footer supplementary views are made by subclassing it; in JS, native classes can't be subclassed, and supplementary views aren't available yet.

## See also

- [`UICollectionViewCell`](ui-collection-view-cell.md)
- [Registering and dequeuing cells](ui-collection-view.md#registering-and-dequeuing-cells)
