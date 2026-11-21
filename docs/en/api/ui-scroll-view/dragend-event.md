---
type: reference
native: "UIScrollViewDelegate scrollViewDidEndDragging:willDecelerate:"
---

# `UIScrollView`: `dragend` event

The **`dragend`** event fires when the user lifts their finger.

## Syntax

```
scroller.addEventListener('dragend', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (this scroll view) and carries no other data. Not cancelable.

## When it fires

- Reading [`isDecelerating`](isdecelerating.md) in the callback gives the actual result of "whether it is still sliding after release".
- If the finger has no velocity when it lifts, the content does not slide on, so there is no `deceleratebegin` or `decelerateend` afterward (**not verified in the simulator**). So to act when the content stops, listen for both `dragend` and `decelerateend`.
- Fires after the change, once the current JS finishes running. When the callback runs, the scroll view's state is already the new one.
- No overhead without listeners.

## Examples

```js
const scroller = new UIScrollView();
function settled() {
  console.log('Stopped at', scroller.contentOffset.y);
}
scroller.addEventListener('decelerateend', settled);
scroller.addEventListener('dragend', () => {
  if (!scroller.isDecelerating) settled();
});
```

**Effect**: whether or not the content slides on after release, logs the stopping position once when the content stops. **Not verified in the simulator.**

## Corresponding iOS API

`scrollViewDidEndDragging:willDecelerate:` of `UIScrollViewDelegate`. Read `isDecelerating` instead of the `willDecelerate` argument.

## See also

- [`decelerateend`](decelerateend-event.md)
- [`beforedragend`](beforedragend-event.md): fires the moment the finger lifts, before `dragend`, and can change where the content stops
