---
type: reference
native: UICollectionViewCell.selected
---

# `UICollectionViewCell`: `isSelected` property

The **`isSelected`** property indicates whether this item is selected.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | This item looks selected |
| `false` | It doesn't |

- Readable and writable.
- The default value is `false` (measured).
- The collection view maintains it; you usually don't write it. To select an item, use the collection view's [`selectItemAtIndexPath()`](../ui-collection-view/selectitematindexpath.md).
- There is no separate change event. Learn about selection changes from the collection view's `itemselect` and `itemdeselect`.

## Examples

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  console.log(cell.isSelected);
}
```

**Result**: calling `inspect(cell)` on a freshly obtained cell logs `false`.

## Corresponding iOS API

`UICollectionViewCell.selected` (the getter is `isSelected`).

## See also

- [`itemselect`](../ui-collection-view/itemselect-event.md)
