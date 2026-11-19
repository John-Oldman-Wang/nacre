---
type: reference
native: "UIScrollViewDelegate scrollViewWillBeginDecelerating:"
---

# `UIScrollView`: `deceleratebegin` event

The **`deceleratebegin`** event fires after the user lifts their finger, when the content starts sliding on.

## Syntax

```
scroller.addEventListener('deceleratebegin', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (this scroll view) and carries no other data. Not cancelable.

## When it fires

- After `dragend` (verified by testing).
- When the callback runs, [`isDecelerating`](isdecelerating.md) is `true`.
- If the content has already stopped when the finger lifts, it does not fire (**not verified in the simulator**).
- Fires after the change, once the current JS finishes running. When the callback runs, the scroll view's state is already the new one.
- No overhead without listeners.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('deceleratebegin', () => console.log('Decelerating'));
```

**Effect**: when the user flicks quickly and releases, the console logs `Decelerating`.

## Corresponding iOS API

`scrollViewWillBeginDecelerating:` of `UIScrollViewDelegate`.

## See also

- [`decelerateend`](decelerateend-event.md)
