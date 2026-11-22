---
type: reference
native: UIScrollViewDragEndEvent.targetContentOffset
---

# `UIScrollViewDragEndEvent`: `targetContentOffset` property

The **`targetContentOffset`** property is the [`contentOffset`](../ui-scroll-view/contentoffset.md) where the content will stop. When a listener writes it, the content stops at the position written.

## Value

A [`CGPoint`](../cg-point.md), in [pt](../units.md). It starts as the stopping position the system computed.

- Readable and writable.
- Write a `CGPoint`, or a plain object with numeric `x` and `y` such as `{ x: 0, y: 40 }`. After all listeners have run, the content slides to that position and stops.
- If nothing is written, it stops at the position the system computed.
- How the content stops when the position written is outside the content area is **not verified in the simulator**.
- On an event created with [`new`](constructor.md), it is `null` until written.

### Invalid values

- Writing another value (a string, an object missing fields, `NaN`) doesn't throw and gives no warning. This time the content stops at the position the system computed.

## Examples

```js
const scroller = new UIScrollView();
const rowHeight = 80;
scroller.addEventListener('beforedragend', (e) => {
  const y = Math.round(e.targetContentOffset.y / rowHeight) * rowHeight;
  e.targetContentOffset = new CGPoint(0, y);
});
```

**Effect**: after dragging and lifting, the content always stops aligned to a multiple of 80 pt.

## Corresponding iOS API

The `targetContentOffset` parameter of `scrollViewWillEndDragging:withVelocity:targetContentOffset:`. Native code changes it through a pointer; here you assign to the property.

## See also

- [`UIScrollViewDragEndEvent`](../ui-scroll-view-drag-end-event.md)
