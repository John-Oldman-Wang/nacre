---
type: reference
native: UICollectionView.numberOfSections
---

# `UICollectionView`: `numberOfSections` property

The **`numberOfSections`** property is the number of sections the list currently has.

## Value

A number, the count.

- Read-only. Assigning to it throws `TypeError`.
- With no data source attached, the system reports `1` (verified by testing), with 0 items in that section.
- No dedicated change event. The data changes because the app called `applySnapshot()`.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.numberOfSections, list.numberOfItemsInSection(0));
```

**Result**: prints `1 0`.

## Corresponding iOS API

`UICollectionView.numberOfSections`.

## See also

- [`numberOfItemsInSection()`](numberofitemsinsection.md)
