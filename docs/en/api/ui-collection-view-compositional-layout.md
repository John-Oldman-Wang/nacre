---
type: reference
native: UICollectionViewCompositionalLayout
status: partial
---

# `UICollectionViewCompositionalLayout`

**`UICollectionViewCompositionalLayout`** represents a compositional layout: a layout object built from sections, groups, and items. For now it can only build list layouts: pass a [`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md) to [`layoutWithListConfiguration()`](ui-collection-view-compositional-layout/layoutwithlistconfiguration.md), and pass the resulting layout to [`new UICollectionView()`](ui-collection-view/constructor.md).

**Inheritance**: `EventTarget` → `NSObject` → [`UICollectionViewLayout`](ui-collection-view-layout.md) → `UICollectionViewCompositionalLayout`

## Constructor

It can't be created with `new`; `new UICollectionViewCompositionalLayout()` throws `TypeError`. Use the static method below.

## Static methods

[`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`](ui-collection-view-compositional-layout/layoutwithlistconfiguration.md)

Creates a list layout from a list configuration.

## Examples

```js
const layout = UICollectionViewCompositionalLayout.layoutWithListConfiguration(
  new UICollectionLayoutListConfiguration('insetGrouped'));
const list = new UICollectionView(layout);
console.log(list.collectionViewLayout === layout);
```

**Result**: You get a list with a rounded-card look. The console prints `true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UICollectionViewCompositionalLayout layoutWithListConfiguration:config]` | `UICollectionViewCompositionalLayout.layoutWithListConfiguration(config)` |

## See also

- [`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md): the list's appearance
- [`UICollectionView`](ui-collection-view.md)
