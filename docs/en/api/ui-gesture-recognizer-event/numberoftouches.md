---
type: reference
native: UIGestureRecognizerEvent.numberOfTouches
---

# `UIGestureRecognizerEvent`: `numberOfTouches` property

The **`numberOfTouches`** property is the number of fingers taking part in the gesture when the event happened.

## Value

A number of fingers.

- Read-only. Assigning to it throws `TypeError`.
- For a one-finger gesture, it is still 1 in the `ended` fired when the finger lifts.
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const page = new UIViewController();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', (e) => {
  console.log(e.numberOfTouches + ' 根手指');
});
page.view.addGestureRecognizer(drag);
```

**Effect**: dragging on the page prints the number of fingers, for example `1 根手指`.

## Corresponding iOS API

`recognizer.numberOfTouches`.

## See also

- [`UIGestureRecognizerEvent`](../ui-gesture-recognizer-event.md)
