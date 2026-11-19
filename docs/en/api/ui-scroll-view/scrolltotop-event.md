---
type: reference
native: "UIScrollViewDelegate scrollViewDidScrollToTop:"
---

# `UIScrollView`: `scrolltotop` event

The **`scrolltotop`** event fires after the user taps the status bar at the top of the screen and the scroll view scrolls back to the top.

## Syntax

```
scroller.addEventListener('scrolltotop', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (this scroll view) and carries no other data. Not cancelable.

## When it fires

- Only scroll views whose [`scrollsToTop`](scrollstotop.md) is `true` scroll back to the top.
- Only one scroll view on a screen can have `scrollsToTop` set to `true`. If several do, tapping the status bar does nothing for any of them.
- It requires a real tap on the status bar to trigger; **not verified in the simulator**.
- Fires after the change, once the current JS finishes running. When the callback runs, the scroll view's state is already the new one.
- No overhead without listeners.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('scrolltotop', () => console.log('Back at the top'));
```

**Effect**: after the user taps the status bar and the content scrolls back to the top, the console logs `Back at the top`. **Not verified in the simulator.**

## Corresponding iOS API

`scrollViewDidScrollToTop:` of `UIScrollViewDelegate`.

## See also

- [`scrollsToTop`](scrollstotop.md)
