---
type: reference
native: UIScrollView.contentOffset
---

# `UIScrollView`: `contentOffset` property

The **`contentOffset`** property is the current scroll position: how far the top-left corner of the content area has moved out relative to the top-left corner of the visible area. Scrolling down increases `y`; scrolling right increases `x`.

## Value

A [`CGPoint`](../structs.md), in [pt](../units.md).

- Readable and writable.
- Defaults to `(0, 0)`.
- Writing jumps there immediately, without animation, and takes effect synchronously: the next line reads the new value. For animation, use [`setContentOffset()`](setcontentoffset.md).
- When writing, you can pass a `CGPoint` or a plain object `{ x, y }`.
- Each read returns a new object with read-only fields. To change it, assign a whole new value; see [Structs](../structs.md).
- With safe area space, the very top is a negative number; see [Safe area](../ui-scroll-view.md#safe-area). To go back to the top, write `-adjustedContentInset.top`.
- [`scroll`](scroll-event.md) fires when it changes, for user scrolling, momentum scrolling, and writes from code. Writes before the window is shown do not fire it (verified by testing).

### Invalid values

- Not an object: `TypeError: contentOffset needs an object with all of: x, y`
- A missing field, or a field that is not a finite number: `TypeError: contentOffset is missing y, or it is not a finite number`

After throwing, the property keeps its previous value.

## Examples

```js
const scroller = new UIScrollView();
scroller.contentOffset = new CGPoint(0, 500);
console.log(scroller.contentOffset.y);
```

**Result**: jumps immediately to 500 pt down, with no transition. The console logs `500`.

## Corresponding iOS API

`UIScrollView.contentOffset`. `CGPointMake(0, 30)` is written `new CGPoint(0, 30)`.

## See also

- The [`scroll`](scroll-event.md) event
- [`setContentOffset()`](setcontentoffset.md)
