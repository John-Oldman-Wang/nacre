---
type: reference
native: "-[UICollectionView registerClass:forCellWithReuseIdentifier:]"
---

# `UICollectionView`: `registerClass()` method

The **`registerClass()`** method registers a kind of cell and gives it a reuse identifier. You then get cells by that reuse identifier inside `cellProvider`.

## Syntax

```
registerClass(cellClass, { forCellWithReuseIdentifier })
```

### Parameters

**`cellClass`**

The cell class itself: [`UICollectionViewCell`](../ui-collection-view-cell.md) or [`UICollectionViewListCell`](../ui-collection-view-list-cell.md). List layouts use `UICollectionViewListCell`.

**`options.forCellWithReuseIdentifier`**

The reuse identifier, a non-empty string, required. A reuse identifier means "which kind of cell"; it's different from an item identifier.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `cellClass` isn't a cell class (for example `UIView`, or a string): `registerClass needs UICollectionViewCell or a subclass of it`
- No reuse identifier given: `registerClass needs { forCellWithReuseIdentifier }`
- The reuse identifier is an empty string: `registerClass needs a non-empty forCellWithReuseIdentifier`

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });
```

**Effect**: afterwards, `cellProvider` can get a `UICollectionViewListCell` with `'row'`.

## Corresponding iOS API

`-[UICollectionView registerClass:forCellWithReuseIdentifier:]`. ObjC writes `UICollectionViewListCell.class`; JS writes the class name directly.

## See also

- [`dequeueReusableCellWithReuseIdentifier()`](dequeuereusablecellwithreuseidentifier.md)
- [Registering and dequeuing cells](../ui-collection-view.md#registering-and-dequeuing-cells)
