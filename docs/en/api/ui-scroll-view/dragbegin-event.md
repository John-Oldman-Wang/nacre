---
type: reference
native: "UIScrollViewDelegate scrollViewWillBeginDragging:"
---

# `UIScrollView`: `dragbegin` event

The **`dragbegin`** event fires when the user starts dragging.

## Syntax

```
scroller.addEventListener('dragbegin', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (this scroll view) and carries no other data. Not cancelable.

## When it fires

- When the callback runs, [`isDragging`](isdragging.md) is `true`.
- When the user drags and releases, the order is `dragbegin` → `dragend` → `deceleratebegin` → `decelerateend` (verified by testing).
- Fires after the change, once the current JS finishes running. When the callback runs, the scroll view's state is already the new one.
- No overhead without listeners.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('dragbegin', () => console.log('Drag started'));
scroller.addEventListener('dragend', () => console.log('Released'));
scroller.addEventListener('decelerateend', () => console.log('Fully stopped'));
```

**Effect**: when the user drags and releases, logs `Drag started`, `Released`, and `Fully stopped` in order (order verified by testing).

## Corresponding iOS API

`scrollViewWillBeginDragging:` of `UIScrollViewDelegate`.

## See also

- [`dragend`](dragend-event.md)
