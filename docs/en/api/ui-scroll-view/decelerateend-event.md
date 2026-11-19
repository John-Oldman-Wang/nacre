---
type: reference
native: "UIScrollViewDelegate scrollViewDidEndDecelerating:"
---

# `UIScrollView`: `decelerateend` event

The **`decelerateend`** event fires when momentum scrolling ends and the content comes to a complete stop.

## Syntax

```
scroller.addEventListener('decelerateend', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (this scroll view) and carries no other data. Not cancelable.

## When it fires

- After `deceleratebegin` (verified by testing).
- If the content has already stopped when the finger lifts, it does not fire (**not verified in the simulator**). In that case, check in [`dragend`](dragend-event.md).
- When a `setContentOffset()` animation ends, [`scrollanimationend`](scrollanimationend-event.md) fires, not this.
- Fires after the change, once the current JS finishes running. When the callback runs, the scroll view's state is already the new one.
- No overhead without listeners.

## Examples

```js
const scroller = new UIScrollView();
scroller.isPagingEnabled = true;
scroller.addEventListener('decelerateend', () => {
  const index = Math.round(scroller.contentOffset.x / scroller.bounds.width);
  console.log('Page', index);
});
```

**Effect**: each time a horizontally paging scroll view stops, logs which page it is on (starting from 0). **Not verified in the simulator.**

## Corresponding iOS API

`scrollViewDidEndDecelerating:` of `UIScrollViewDelegate`.

## See also

- [`dragend`](dragend-event.md)
