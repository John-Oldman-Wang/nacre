---
type: reference
native: UICollectionViewLayout
---

# `UICollectionViewLayout`

**`UICollectionViewLayout`** represents the object that decides how cells are arranged in a [`UICollectionView`](ui-collection-view.md). It is the base class of layout objects: the argument [`UICollectionView()`](ui-collection-view/constructor.md) takes and the value [`collectionViewLayout`](ui-collection-view/collectionviewlayout.md) returns are both of this type.

It has no members of its own. The only layout currently available is the list layout created by [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md).

**Inheritance**: `EventTarget` → `NSObject` → `UICollectionViewLayout`

## Constructor

Cannot be created with `new`; `new UICollectionViewLayout()` throws `TypeError`. Create a layout with [`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`](ui-collection-view-compositional-layout/layoutwithlistconfiguration.md).

## Corresponding iOS API

`UICollectionViewLayout`. In ObjC you customize layout by subclassing it; in JS native classes cannot be subclassed, see [Native classes](native-classes.md).

## See also

- [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md)
- [`UICollectionView`](ui-collection-view.md)
