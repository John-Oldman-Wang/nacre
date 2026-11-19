---
type: reference
native: UIScrollView.isScrollAnimating
---

# `UIScrollView`: `isScrollAnimating` property

The **`isScrollAnimating`** property indicates that an animation started by [`setContentOffset()`](setcontentoffset.md) is running.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | An animation started by [`setContentOffset()`](setcontentoffset.md) is running |
| `false` | Otherwise |

- Read-only. Assigning to it throws `TypeError`.
- `false` for a new scroll view.
- [`scrollanimationend`](scrollanimationend-event.md) fires when the animation ends.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('scroll', () => {
  console.log(scroller.isScrollAnimating);
});
```

**Effect**: logs this state while scrolling. It is `true` while an animation started by [`setContentOffset()`](setcontentoffset.md) is running.

## Corresponding iOS API

`UIScrollView.isScrollAnimating`.

## See also

- [Events](../ui-scroll-view.md#events)
