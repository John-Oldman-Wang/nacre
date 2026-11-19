---
type: reference
native: "UIScrollViewDelegate scrollViewDidEndScrollingAnimation:"
---

# `UIScrollView`: `scrollanimationend` event

The **`scrollanimationend`** event fires when an animated scroll by [`setContentOffset()`](setcontentoffset.md) ends.

## Syntax

```
scroller.addEventListener('scrollanimationend', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (this scroll view) and carries no other data. Not cancelable.

## When it fires

- Only an animated `setContentOffset()` causes it. Writing `contentOffset` directly does not fire it.
- When the callback runs, [`isScrollAnimating`](isscrollanimating.md) is `false`.
- Fires after the change, once the current JS finishes running. When the callback runs, the scroll view's state is already the new one.
- No overhead without listeners.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('scrollanimationend', () => console.log('Arrived'));
scroller.setContentOffset(new CGPoint(0, 500), { animated: true });
```

**Effect**: when the animation ends, the console logs `Arrived`.

## Corresponding iOS API

`scrollViewDidEndScrollingAnimation:` of `UIScrollViewDelegate`.

## See also

- [`setContentOffset()`](setcontentoffset.md)
