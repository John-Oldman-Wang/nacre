---
type: reference
native: "UICollectionViewDelegate collectionView:didEndDisplayingCell:forItemAtIndexPath:"
---

# `UICollectionView`: `displayend` event

The **`displayend`** event fires after an item's cell leaves the screen.

## Syntax

```
list.addEventListener('displayend', (event) => { })
```

## Event object

[`UICollectionViewItemEvent`](../ui-collection-view-item-event.md). `type` is the event name, `target` is the list, and there's one extra read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`indexPath`](../ui-collection-view-item-event/indexpath.md) | [`NSIndexPath`](../ns-index-path.md) | The item's position at the moment the event occurred |

Not cancelable; `preventDefault()` has no effect.

## When it fires

- When an item scrolls off screen or is deleted.
- By then its cell may already have been reused to display another item.
- The callback runs after the current round of code. If the data changes before the callback runs, the position `indexPath` may now hold a different item or no item. First convert it to an identifier with [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md); a result of `null` means the position no longer has an item.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('displayend', (event) => {
  console.log('Left the screen ' + String(event.indexPath));
});
```

**Effect**: when a row scrolls off screen, the console prints its former position.

## Corresponding iOS API

`collectionView:didEndDisplayingCell:forItemAtIndexPath:` of `UICollectionViewDelegate`.

## See also

- [`beforedisplay`](beforedisplay-event.md)
