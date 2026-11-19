---
type: reference
native: UIScrollView.pinchGestureRecognizer
---

# `UIScrollView`: `pinchGestureRecognizer` property

The **`pinchGestureRecognizer`** property is the gesture recognizer the scroll view uses to recognize two-finger pinches.

## Value

A [`UIPinchGestureRecognizer`](../ui-gesture-recognizer.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- It may be `null` when zooming is not possible (minimum and maximum scale both `1`). The acceptance tests accept either.
- Two-finger pinch zooming does not work yet: the system needs to ask on the spot "which subview is being zoomed", and that question is not wired up yet.

## Examples

```js
const scroller = new UIScrollView();
console.log(scroller.pinchGestureRecognizer === null);
```

**Result**: on a new scroll view, logs `true` or `false`. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.pinchGestureRecognizer`.

## See also

- [`zoomScale`](zoomscale.md)
