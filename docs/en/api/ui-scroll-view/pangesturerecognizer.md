---
type: reference
native: UIScrollView.panGestureRecognizer
---

# `UIScrollView`: `panGestureRecognizer` property

The **`panGestureRecognizer`** property is the gesture recognizer the scroll view uses to recognize dragging.

## Value

A [`UIPanGestureRecognizer`](../ui-gesture-recognizer.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it twice gives the same object (verified by testing).
- It is a `UIPanGestureRecognizer` (verified by testing).
- What you can do with it once you have it (reading drag velocity, coordinating with other gestures) is **not verified in the simulator**.

## Examples

```js
const scroller = new UIScrollView();
const pan = scroller.panGestureRecognizer;
console.log(pan instanceof UIPanGestureRecognizer, pan === scroller.panGestureRecognizer);
```

**Result**: logs `true true`.

## Corresponding iOS API

`UIScrollView.panGestureRecognizer`.

## See also

- [Gesture recognizers](../ui-gesture-recognizer.md)
