---
type: reference
native: "UICollectionViewDelegate collectionView:willDisplayCell:forItemAtIndexPath:"
---

# `UICollectionView`: `beforedisplay` event

The **`beforedisplay`** event fires when an item's cell is about to appear on screen.

## Syntax

```
list.addEventListener('beforedisplay', (event) => { })
```

## Event object

`UICollectionViewItemEvent`. `type` is the event name, `target` is the list, and there's one extra read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| `indexPath` | [`NSIndexPath`](../ns-index-path.md) | The item's position at the moment the event occurred |

Not cancelable; `preventDefault()` has no effect.

## When it fires

- When the list is first displayed and while it scrolls, once for each item before it enters the screen.
- Get the cell from [`cellForItemAtIndexPath()`](cellforitematindexpath.md).
- The callback runs after the current round of code. If the data changes before the callback runs, the position `indexPath` may now hold a different item or no item. First convert it to an identifier with [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md); a result of `null` means the position no longer has an item.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('beforedisplay', (event) => {
  const last = list.numberOfItemsInSection(event.indexPath.section) - 1;
  if (event.indexPath.item >= last - 5) console.log('Nearly at the end');
});
```

**Effect**: when scrolling reaches 5 rows from the end, the console prints `Nearly at the end`. When loading the next page, guard against triggering it repeatedly yourself.

## Corresponding iOS API

`collectionView:willDisplayCell:forItemAtIndexPath:` of `UICollectionViewDelegate`. The cell parameter is removed; get it with `cellForItemAtIndexPath()`.

## See also

- [`displayend`](displayend-event.md)
- [Loading more near the end](../../guides/lists.md#loading-more-near-the-bottom)
