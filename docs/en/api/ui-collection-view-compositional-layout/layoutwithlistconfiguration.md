---
type: reference
native: "+[UICollectionViewCompositionalLayout layoutWithListConfiguration:]"
---

# `UICollectionViewCompositionalLayout.layoutWithListConfiguration()` static method

The **`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`** static method creates a list layout from a list configuration.

## Syntax

```
UICollectionViewCompositionalLayout.layoutWithListConfiguration(configuration)
```

### Parameters

**`configuration`**

The list configuration, a [`UICollectionLayoutListConfiguration`](../ui-collection-layout-list-configuration.md). It is copied into the layout at this moment; changing it afterward doesn't affect the layout already created.

### Return value

A new `UICollectionViewCompositionalLayout`, which is also a [`UICollectionViewLayout`](../ui-collection-view-layout.md) (verified by testing). Pass it to [`new UICollectionView()`](../ui-collection-view/constructor.md).

### Exceptions

**`TypeError`**

`configuration` isn't a configuration object (verified by testing).

## Examples

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
const layout = UICollectionViewCompositionalLayout.layoutWithListConfiguration(config);
console.log(layout instanceof UICollectionViewLayout);
const list = new UICollectionView(layout);
```

**Result**: It prints `true`. You get a list with a rounded-card look.

## Corresponding iOS API

`+[UICollectionViewCompositionalLayout layoutWithListConfiguration:]`.

## See also

- [`UICollectionLayoutListConfiguration`](../ui-collection-layout-list-configuration.md)
