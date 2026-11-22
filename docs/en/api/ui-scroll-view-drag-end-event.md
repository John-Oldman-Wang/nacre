---
type: reference
native: UIScrollViewDragEndEvent
---

# `UIScrollViewDragEndEvent`

**`UIScrollViewDragEndEvent`** represents the moment the user lifts the finger after dragging a scroll view.

The [`beforedragend`](ui-scroll-view/beforedragend-event.md) event of [`UIScrollView`](ui-scroll-view.md) is this class. It carries the speed at release and the position where the content will stop; a listener can change that position so the content stops elsewhere, for example aligned to a row boundary.

**Inheritance**: [`Event`](event.md) → `UIScrollViewDragEndEvent`

## Constructor

[`UIScrollViewDragEndEvent()`](ui-scroll-view-drag-end-event/constructor.md)

Creates a `UIScrollViewDragEndEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only except `targetContentOffset`; assigning to a read-only one throws `TypeError`.

| Property | Description |
| --- | --- |
| [`velocity`](ui-scroll-view-drag-end-event/velocity.md) <small>read-only</small> | How fast the content was moving at release |
| [`targetContentOffset`](ui-scroll-view-drag-end-event/targetcontentoffset.md) | Where the content will stop. Writable; the content stops where you write |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIScrollView`](ui-scroll-view.md) and its subclasses | [`beforedragend`](ui-scroll-view/beforedragend-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. To keep the content where it is, write the current `contentOffset` to [`targetContentOffset`](ui-scroll-view-drag-end-event/targetcontentoffset.md).

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('beforedragend', (e) => {
  console.log(e instanceof UIScrollViewDragEndEvent, e.velocity.y, e.targetContentOffset.y);
});
```

**Effect**: dragging `scroller` and lifting prints `true`, the vertical speed, and the stopping position the system computed.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `scrollViewWillEndDragging:withVelocity:targetContentOffset:` | The `beforedragend` event |
| The `velocity` parameter | `event.velocity` |
| `*targetContentOffset = CGPointMake(0, y)` | `event.targetContentOffset = new CGPoint(0, y)` |

## See also

- [`beforedragend`](ui-scroll-view/beforedragend-event.md): when it is fired
- [Building a scrolling view](../guides/scrolling.md)
