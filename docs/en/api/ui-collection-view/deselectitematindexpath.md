---
type: reference
native: "-[UICollectionView deselectItemAtIndexPath:animated:]"
---

# `UICollectionView`: `deselectItemAtIndexPath()` method

The **`deselectItemAtIndexPath()`** method deselects an item from code.

## Syntax

```
deselectItemAtIndexPath(indexPath)
deselectItemAtIndexPath(indexPath, { animated })
```

### Parameters

**`indexPath`**

The item's position, an [`NSIndexPath`](../ns-index-path.md) or `{ section, item }`.

**`options.animated`**

A boolean, optional. Defaults to `false`. When `true`, the selection highlight fades out.

### Return value

None (`undefined`).

Doesn't fire [`itemdeselect`](itemdeselect-event.md) (verified by testing).

### Exceptions

**`TypeError`**

There's no item at the position: `deselectItemAtIndexPath: there is no item at section 9, item 0`

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('itemselect', (event) => {
  list.deselectItemAtIndexPath(event.indexPath, { animated: true });
});
```

**Effect**: tapping a row makes its highlight fade out. **Not verified in the simulator.**

## Corresponding iOS API

`-[UICollectionView deselectItemAtIndexPath:animated:]`.

## See also

- [`selectItemAtIndexPath()`](selectitematindexpath.md)
