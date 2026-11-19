---
type: reference
native: "-[UICollectionView numberOfItemsInSection:]"
---

# `UICollectionView`: `numberOfItemsInSection()` method

The **`numberOfItemsInSection()`** method returns how many items section number `section` contains.

## Syntax

```
numberOfItemsInSection(section)
```

### Parameters

**`section`**

The section index, an integer counting from 0.

### Return value

A number, the count.

### Exceptions

**`TypeError`**

The section doesn't exist: `numberOfItemsInSection: there is no section 3`

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.numberOfItemsInSection(0));
```

**Result**: prints `0` when no data source is attached.

## Corresponding iOS API

`-[UICollectionView numberOfItemsInSection:]`.

## See also

- [`numberOfSections`](numberofsections.md)
- [Loading more near the end](../../guides/lists.md#loading-more-near-the-bottom)
