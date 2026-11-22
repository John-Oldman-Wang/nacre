---
type: reference
native: UIPinchGestureRecognizerEvent.scale
---

# `UIPinchGestureRecognizerEvent`: `scale` property

The **`scale`** property is the distance between the two fingers, as a multiple of the distance when the gesture began.

## Value

A number; a multiple with no unit. Spreading makes it greater than 1; pinching makes it less than 1.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `1`.

## Examples

```js
const photo = new UIView();
const pinch = new UIPinchGestureRecognizer();
pinch.addEventListener('changed', (e) => {
  photo.transform = CGAffineTransform.scale(e.scale, e.scale);
});
photo.addGestureRecognizer(pinch);
```

**Effect**: spreading or pinching two fingers on `photo` scales it up or down.

## Corresponding iOS API

`recognizer.scale`.

## See also

- [`UIPinchGestureRecognizerEvent`](../ui-pinch-gesture-recognizer-event.md)
