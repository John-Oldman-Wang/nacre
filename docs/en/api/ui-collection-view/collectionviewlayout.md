---
type: reference
native: UICollectionView.collectionViewLayout
---

# `UICollectionView`: `collectionViewLayout` property

The **`collectionViewLayout`** property is the layout object given when the list was created.

## Value

A [`UICollectionViewLayout`](../ui-collection-view-layout.md).

- Read-only. Assigning to it throws `TypeError`.
- Reading it returns the very object given at creation (verified by testing).

## Examples

```js
const layout = UICollectionViewCompositionalLayout.layoutWithListConfiguration(
  new UICollectionLayoutListConfiguration('plain'));
const list = new UICollectionView(layout);
console.log(list.collectionViewLayout === layout);
```

**Result**: prints `true`.

## Corresponding iOS API

`UICollectionView.collectionViewLayout`. In ObjC the layout can be replaced (`setCollectionViewLayout:animated:`); here it can't.

## See also

- [`UICollectionView()`](constructor.md)
