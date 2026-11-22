---
type: reference
native: UIPinchGestureRecognizerEvent.velocity
---

# `UIPinchGestureRecognizerEvent`: `velocity` property

The **`velocity`** property is how much [`scale`](scale.md) changes per second.

## Value

A number, in multiples per second. It is positive while spreading and negative while pinching.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const photo = new UIView();
const pinch = new UIPinchGestureRecognizer();
pinch.addEventListener('ended', (e) => {
  console.log(e.velocity > 0 ? '张开' : '捏拢');
});
photo.addGestureRecognizer(pinch);
```

**Effect**: after pinching on `photo` and lifting, prints `张开` or `捏拢` depending on the direction at release.

## Corresponding iOS API

`recognizer.velocity`.

## See also

- [`UIPinchGestureRecognizerEvent`](../ui-pinch-gesture-recognizer-event.md)
