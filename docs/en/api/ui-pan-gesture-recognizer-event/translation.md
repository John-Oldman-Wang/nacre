---
type: reference
native: UIPanGestureRecognizerEvent.translation
---

# `UIPanGestureRecognizerEvent`: `translation` property

The **`translation`** property is how far the finger has moved from the start of the gesture up to this event.

## Value

A [`CGPoint`](../cg-point.md) in the coordinate system of the recognizer's view, in [pt](../units.md). Positive `x` is to the right; positive `y` is downward.

- Read-only. Assigning to it throws `TypeError`.
- In `began`, it is close to `(0, 0)`.
- It is the accumulated distance, not the difference from the previous event.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
let start = card.center;
drag.addEventListener('began', () => {
  start = card.center;
});
drag.addEventListener('changed', (e) => {
  card.center = new CGPoint(start.x + e.translation.x, start.y + e.translation.y);
});
card.addGestureRecognizer(drag);
```

**Effect**: `card` follows the finger.

## Corresponding iOS API

`[recognizer translationInView:recognizer.view]`.

## See also

- [`UIPanGestureRecognizerEvent`](../ui-pan-gesture-recognizer-event.md)
