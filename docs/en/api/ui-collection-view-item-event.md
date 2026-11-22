---
type: reference
native: UICollectionViewItemEvent
---

# `UICollectionViewItemEvent`

**`UICollectionViewItemEvent`** represents something that happened to one item in a list: it was selected, deselected, is about to be displayed, or is no longer displayed.

Four events of [`UICollectionView`](ui-collection-view.md) are this class, and [`indexPath`](ui-collection-view-item-event/indexpath.md) is the position of the item.

**Inheritance**: [`Event`](event.md) → `UICollectionViewItemEvent`

## Constructor

[`UICollectionViewItemEvent()`](ui-collection-view-item-event/constructor.md)

Creates a `UICollectionViewItemEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`indexPath`](ui-collection-view-item-event/indexpath.md) <small>read-only</small> | The position of the item when the event happened |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UICollectionView`](ui-collection-view.md) | [`itemselect`](ui-collection-view/itemselect-event.md), [`itemdeselect`](ui-collection-view/itemdeselect-event.md), [`beforedisplay`](ui-collection-view/beforedisplay-event.md), [`displayend`](ui-collection-view/displayend-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('beforedisplay', (e) => {
  console.log(e instanceof UICollectionViewItemEvent, e.indexPath.item);
});
```

**Effect**: before each item of the list is shown on screen, prints `true` and its position.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `collectionView:didSelectItemAtIndexPath:` | `itemselect` |
| `collectionView:didDeselectItemAtIndexPath:` | `itemdeselect` |
| `collectionView:willDisplayCell:forItemAtIndexPath:` | `beforedisplay` |
| `collectionView:didEndDisplayingCell:forItemAtIndexPath:` | `displayend` |
| The `indexPath` parameter | `event.indexPath` |

## See also

- [`UICollectionView`](ui-collection-view.md): the object that fires these events
- [`NSIndexPath`](ns-index-path.md)
