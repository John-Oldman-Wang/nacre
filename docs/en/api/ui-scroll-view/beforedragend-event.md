---
type: reference
native: "UIScrollViewDelegate scrollViewWillEndDragging:withVelocity:targetContentOffset:"
---

# `UIScrollView`: `beforedragend` event

The **`beforedragend`** event fires the moment the user lifts their finger after dragging, before [`dragend`](dragend-event.md). At that point the system has already worked out where the content will come to rest, and a listener can change that stopping position.

## Syntax

```
scroller.addEventListener('beforedragend', (event) => { })
```

## Event object

[`UIScrollViewDragEndEvent`](../ui-scroll-view-drag-end-event.md). Besides `type` and `target` (this scroll view), it carries two fields:

| Field | Type | Readable | Writable | Meaning |
| --- | --- | --- | --- | --- |
| [`velocity`](../ui-scroll-view-drag-end-event/velocity.md) | [`CGPoint`](../cg-point.md) | Yes | No | How fast the content was moving when the finger lifted, in [pt](../units.md) per millisecond |
| [`targetContentOffset`](../ui-scroll-view-drag-end-event/targetcontentoffset.md) | [`CGPoint`](../cg-point.md) | Yes | Yes | The [`contentOffset`](contentoffset.md) at which the content will stop, in pt. Its initial value is the stopping position the system computed |

Not cancelable: `event.cancelable` is `false` and `preventDefault()` has no effect. To keep the content where it is, write the current `contentOffset` to `targetContentOffset`.

The sign of `velocity` gives the direction, matching the direction in which `contentOffset` changes: a positive `y` means the content is sliding toward a larger `contentOffset.y`. **Not verified with a real finger.**

### Writing `targetContentOffset`

- Write a [`CGPoint`](../cg-point.md), or a plain object with numeric `x` and `y`, such as `{ x: 0, y: 40 }`. After all listeners have run, the content slides to that position and stops.
- Writing any other value (a string, an object missing a field, `NaN`) does not throw and logs no warning. This time the content stops where the system computed.
- If nothing is written, the content stops where the system computed.
- How the content stops when the position written lies outside the content area is **not verified in the simulator**.
- How the content moves to a changed stopping position when the finger had no velocity on release (`velocity` is 0) is **not verified in the simulator**.

## When it fires

- Fires only when the user lifts their finger after dragging. Writing `contentOffset` or calling [`setContentOffset()`](setcontentoffset.md) from code does not fire it (from the iOS definition, **not verified in the simulator**).
- Fires on the spot. After firing the event, the system waits for all listeners to finish, then lets the content slide to `targetContentOffset`. This differs from the other scroll events: they fire after the change, once the current JS finishes running.
- When the event has several listeners, they run in the order they were added. A later listener reads the value an earlier one wrote to `targetContentOffset`, and the last value wins.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). A value written to `targetContentOffset` before the throw still takes effect; if nothing was written, the content stops where the system computed.
- With no listeners, the content stops where the system computed. The same holds after the last listener is removed.
- The firing, the values of both fields, and the position the system stops at after a write are all verified in the acceptance suite: the test asks the scroll view for its stopping position the way the system does when the finger lifts, and asserts the value handed back to the system. How the content slides to the new position under a real dragging finger is **not verified with a real finger**.

> **Note**: The system waits while listeners run. In a listener, only compute the stopping position; do nothing time-consuming.

## Examples

```js
const scroller = new UIScrollView();
const rowHeight = 80;
scroller.addEventListener('beforedragend', (e) => {
  const y = Math.round(e.targetContentOffset.y / rowHeight) * rowHeight;
  e.targetContentOffset = new CGPoint(0, y);
});
```

**Effect**: after every drag and release, the content stops at a position where `contentOffset.y` is a multiple of 80. When the system computes a stop at 123, the content stops at 160. The value handed back to the system is verified in the acceptance suite; how the content slides there is **not verified with a real finger**.

## Corresponding iOS API

`scrollViewWillEndDragging:withVelocity:targetContentOffset:` of `UIScrollViewDelegate`. The `velocity` argument is the event's `velocity`; the `targetContentOffset` out-parameter becomes the writable `targetContentOffset` on the event object.

## See also

- [Stopping on whole rows](../../guides/scrolling.md#stopping-on-whole-rows)
- [`dragend`](dragend-event.md): fires right after; read the state after release there
- [`isPagingEnabled`](ispagingenabled.md): stops at multiples of the visible area, with no listener
- [`decelerationRate`](decelerationrate.md): how far the content slides after release
