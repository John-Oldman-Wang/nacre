---
type: reference
native: UIGestureRecognizerEvent.location
---

# `UIGestureRecognizerEvent`: `location` property

The **`location`** property is the gesture position, in the coordinate system of the view the recognizer is attached to.

## Value

A [`CGPoint`](../cg-point.md) or `null`, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError`.
- With several fingers, it is their center point.
- To convert it to another view's coordinate system, use `convertPoint()` of [`UIView`](../ui-view.md).
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', (e) => {
  if (e.location !== null) {
    console.log('点在', e.location.x, e.location.y);
  }
});
card.addGestureRecognizer(tap);
```

**Effect**: tapping `card` prints `点在` and the position of the tap.

## Corresponding iOS API

`[recognizer locationInView:recognizer.view]`.

## See also

- [`UIGestureRecognizerEvent`](../ui-gesture-recognizer-event.md)
