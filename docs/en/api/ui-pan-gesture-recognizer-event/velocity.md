---
type: reference
native: UIPanGestureRecognizerEvent.velocity
---

# `UIPanGestureRecognizerEvent`: `velocity` property

The **`velocity`** property is how fast the finger is moving when this event happens.

## Value

A [`CGPoint`](../cg-point.md) in the coordinate system of the recognizer's view, in [pt](../units.md) per second. The signs of `x` and `y` follow [`translation`](translation.md).

- Read-only. Assigning to it throws `TypeError`.
- In `ended`, it is the speed at the moment the finger lifted; use it to tell whether the user flicked.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('ended', (e) => {
  if (e.velocity.x > 1000) {
    console.log('向右甩出');
  }
});
card.addGestureRecognizer(drag);
```

**Effect**: swiping right quickly on `card` and lifting the finger prints `向右甩出`.

## Corresponding iOS API

`[recognizer velocityInView:recognizer.view]`.

## See also

- [`UIPanGestureRecognizerEvent`](../ui-pan-gesture-recognizer-event.md)
