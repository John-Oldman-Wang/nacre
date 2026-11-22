---
type: reference
native: "UICollectionViewDelegate collectionView:didDeselectItemAtIndexPath:"
---

# `UICollectionView`: `itemdeselect` event

The **`itemdeselect`** event fires when the user makes an item no longer selected: tapping it again with multiple selection, or tapping another item with single selection.

## Syntax

```
list.addEventListener('itemdeselect', (event) => { })
```

## Event object

[`UICollectionViewItemEvent`](../ui-collection-view-item-event.md). `type` is the event name, `target` is the list, and there's one extra read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`indexPath`](../ui-collection-view-item-event/indexpath.md) | [`NSIndexPath`](../ns-index-path.md) | The item's position at the moment the event occurred |

Not cancelable; `preventDefault()` has no effect.

## When it fires

- When caused by the user's action. **Not verified in the simulator**: only a real touch can trigger it.
- Calling [`deselectItemAtIndexPath()`](deselectitematindexpath.md) from code doesn't fire it (verified by testing).
- The callback runs after the current round of code. If the data changes before the callback runs, the position `indexPath` may now hold a different item or no item. First convert it to an identifier with [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md); a result of `null` means the position no longer has an item.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.allowsMultipleSelection = true;
list.addEventListener('itemdeselect', (event) => {
  console.log('Deselected item ' + event.indexPath.item);
});
```

**Effect**: in a multiple-selection list, tapping a selected row again prints its index to the console. **Not verified in the simulator.**

## Corresponding iOS API

`collectionView:didDeselectItemAtIndexPath:` of `UICollectionViewDelegate`.

## See also

- [`itemselect`](itemselect-event.md)
