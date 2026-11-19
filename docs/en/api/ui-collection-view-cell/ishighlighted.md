---
type: reference
native: UICollectionViewCell.highlighted
---

# `UICollectionViewCell`: `isHighlighted` property

The **`isHighlighted`** property indicates whether a finger is currently pressing this item.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | This item looks pressed |
| `false` | It doesn't |

- Readable and writable.
- The default value is `false` (measured).
- The collection view maintains it; you usually don't write it. To select an item, use the collection view's [`selectItemAtIndexPath()`](../ui-collection-view/selectitematindexpath.md).
- There is no separate change event. Learn about selection changes from the collection view's `itemselect` and `itemdeselect`.

## Examples

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  console.log(cell.isHighlighted);
}
```

**Result**: calling `inspect(cell)` on a freshly obtained cell logs `false`.

## Corresponding iOS API

`UICollectionViewCell.highlighted` (the getter is `isHighlighted`).

## See also

- [`itemselect`](../ui-collection-view/itemselect-event.md)
