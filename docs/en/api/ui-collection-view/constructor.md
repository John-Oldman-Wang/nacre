---
type: reference
native: "-[UICollectionView initWithFrame:collectionViewLayout:]"
---

# `UICollectionView()` constructor

The **`UICollectionView()`** constructor creates a list with a layout object.

## Syntax

```
new UICollectionView(layout)
```

### Parameters

**`layout`**

The layout object, a [`UICollectionViewLayout`](../ui-collection-view-layout.md). Currently it can only be created with [`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`](../ui-collection-view-compositional-layout/layoutwithlistconfiguration.md).

### Return value

A new `UICollectionView`. Its `frame` is 0 × 0; give it a position and size with constraints or `frame`. It has no data source yet, and [`dataSource`](datasource.md) is `null`.

### Exceptions

**`TypeError`**

- `layout` isn't a layout object, or wasn't given.
- `UICollectionView` can't be subclassed; `class X extends UICollectionView {}` throws on `new X()`. See [Native classes](../native-classes.md#no-subclassing).

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list instanceof UIScrollView, list.dataSource);
```

**Result**: prints `true null`.

## Corresponding iOS API

`[[UICollectionView alloc] initWithFrame:CGRectZero collectionViewLayout:layout]`. The `frame` parameter is removed; position it with constraints or the `frame` property.

## See also

- [`UICollectionLayoutListConfiguration`](../ui-collection-layout-list-configuration.md): the list's appearance
