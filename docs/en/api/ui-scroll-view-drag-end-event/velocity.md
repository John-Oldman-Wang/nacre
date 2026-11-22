---
type: reference
native: UIScrollViewDragEndEvent.velocity
---

# `UIScrollViewDragEndEvent`: `velocity` property

The **`velocity`** property is how fast the content was moving when the finger lifted.

## Value

A [`CGPoint`](../cg-point.md), in [pt](../units.md) per millisecond.

- Read-only. Assigning to it throws `TypeError`.
- The sign gives the direction, matching how `contentOffset` changes: when `y` is positive, the content slides toward larger `contentOffset.y`. **Not verified with a real finger.**
- When the finger is still at release, it is `(0, 0)`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('beforedragend', (e) => {
  console.log('松手时的速度', e.velocity.y);
});
```

**Effect**: dragging `scroller` and lifting prints the vertical speed.

## Corresponding iOS API

The `velocity` parameter of `scrollViewWillEndDragging:withVelocity:targetContentOffset:`.

## See also

- [`UIScrollViewDragEndEvent`](../ui-scroll-view-drag-end-event.md)
