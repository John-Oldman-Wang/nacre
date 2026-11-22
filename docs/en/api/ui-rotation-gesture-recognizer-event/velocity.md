---
type: reference
native: UIRotationGestureRecognizerEvent.velocity
---

# `UIRotationGestureRecognizerEvent`: `velocity` property

The **`velocity`** property is the rotation speed.

## Value

A number, in radians per second. Clockwise is positive.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const dial = new UIView();
const turn = new UIRotationGestureRecognizer();
turn.addEventListener('ended', (e) => {
  console.log(e.velocity > 0 ? '顺时针' : '逆时针');
});
dial.addGestureRecognizer(turn);
```

**Effect**: after turning on `dial` and lifting, prints `顺时针` or `逆时针` depending on the direction at release.

## Corresponding iOS API

`recognizer.velocity`.

## See also

- [`UIRotationGestureRecognizerEvent`](../ui-rotation-gesture-recognizer-event.md)
