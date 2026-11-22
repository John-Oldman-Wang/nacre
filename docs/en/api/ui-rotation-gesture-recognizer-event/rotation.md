---
type: reference
native: UIRotationGestureRecognizerEvent.rotation
---

# `UIRotationGestureRecognizerEvent`: `rotation` property

The **`rotation`** property is the angle turned since the gesture began.

## Value

A number, in radians. Clockwise is positive.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const dial = new UIView();
const turn = new UIRotationGestureRecognizer();
turn.addEventListener('changed', (e) => {
  dial.transform = CGAffineTransform.rotation(e.rotation);
});
dial.addGestureRecognizer(turn);
```

**Effect**: turning two fingers on `dial` rotates it along.

## Corresponding iOS API

`recognizer.rotation`.

## See also

- [`UIRotationGestureRecognizerEvent`](../ui-rotation-gesture-recognizer-event.md)
