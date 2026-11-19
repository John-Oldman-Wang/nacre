---
type: reference
native: "UIScrollViewDelegate scrollViewDidScroll:"
---

# `UIScrollView`: `scroll` event

The **`scroll`** event fires when the scroll position changes.

## Syntax

```
scroller.addEventListener('scroll', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (this scroll view) and carries no other data. Not cancelable. Read the position from [`contentOffset`](contentoffset.md).

## When it fires

- User dragging, momentum scrolling after release, writing `contentOffset` from code, and `setContentOffset()` animations all fire it.
- **It coalesces.** Scrolling that happens while a previous `scroll` has not yet fired does not fire separately. So the number of `scroll` events does not equal the number of position changes; do not use it for counting (measured: three consecutive position writes produced only one `scroll`).
- **Writing `contentOffset` before the window is shown does not fire it.** The position is written and reads back correctly, but no event arrives (verified by testing).
- One real swipe lasting 1819 ms fired it 100 times (simulator, Debug build). Reading the position and changing views in the callback is normal usage.
- Fires after the change, once the current JS finishes running. When the callback runs, the scroll view's state is already the new one.
- No overhead without listeners.

## Examples

### Reading the current position

```js
const scroller = new UIScrollView();
scroller.addEventListener('scroll', () => {
  console.log(scroller.contentOffset.y);
});
```

**Effect**: logs a number continuously while scrolling. At the very top it is around `0` (negative with a safe area), and the further down it scrolls the larger it gets, in pt.

### Events coalesce

```js
const scroller = new UIScrollView();
let count = 0;
scroller.addEventListener('scroll', () => { count += 1; });

scroller.contentOffset = new CGPoint(0, 10);
scroller.contentOffset = new CGPoint(0, 20);
scroller.contentOffset = new CGPoint(0, 30);
console.log(scroller.contentOffset.y);

setTimeout(() => console.log(count), 100);
```

**Result**: the first line logs `30` immediately; writes take effect synchronously. 100 ms later it logs `1` (verified by testing, with the scroll view in a window already shown). The callback was not called at all while the three assignments ran.

## Corresponding iOS API

`scrollViewDidScroll:` of `UIScrollViewDelegate`.

## See also

- [`contentOffset`](contentoffset.md)
- [Scrolling and JS](../ui-scroll-view.md#scrolling-and-js)
