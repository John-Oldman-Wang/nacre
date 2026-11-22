---
type: reference
native: UIGestureRecognizerStateEnded
---

# `UIGestureRecognizer`: `ended` event

The **`ended`** event fires when a gesture ends normally. A discrete gesture (tap, swipe) also fires this event when it is recognized, and fires only this one.

## Syntax

```
addEventListener('ended', (event) => { })
```

## Event object

[`UIGestureRecognizerEvent`](../ui-gesture-recognizer-event.md). Besides `type` and `target`, it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`location`](../ui-gesture-recognizer-event/location.md) | [`CGPoint`](../structs.md) or `null` | The position of the gesture, in the coordinate system of the view the recognizer is attached to, in [pt](../units.md). With several fingers, it is their center point. To convert to another view, use the view's `convertPoint()` |
| [`numberOfTouches`](../ui-gesture-recognizer-event/numberoftouches.md) | Number | The number of fingers taking part in the gesture when the event occurred |

The event objects of three kinds of recognizer are its subclasses, each carrying two more read-only fields, all values as of the moment the event occurred:

| Recognizer | Event object type | Field | Type | Meaning |
| --- | --- | --- | --- | --- |
| [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md), [`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md) | [`UIPanGestureRecognizerEvent`](../ui-pan-gesture-recognizer-event.md) | [`translation`](../ui-pan-gesture-recognizer-event/translation.md) | `CGPoint` | How far the finger has moved from the start of the gesture up to this event, in the coordinate system of the view the recognizer is attached to, in pt |
| | | [`velocity`](../ui-pan-gesture-recognizer-event/velocity.md) | `CGPoint` | The speed of the finger's movement, in the same coordinate system, in pt per second |
| [`UIPinchGestureRecognizer`](../ui-pinch-gesture-recognizer.md) | [`UIPinchGestureRecognizerEvent`](../ui-pinch-gesture-recognizer-event.md) | [`scale`](../ui-pinch-gesture-recognizer-event/scale.md) | Number | The distance between the two fingers as a multiple of the distance at the start of the gesture |
| | | [`velocity`](../ui-pinch-gesture-recognizer-event/velocity.md) | Number | How much `scale` changes per second |
| [`UIRotationGestureRecognizer`](../ui-rotation-gesture-recognizer.md) | [`UIRotationGestureRecognizerEvent`](../ui-rotation-gesture-recognizer-event.md) | [`rotation`](../ui-rotation-gesture-recognizer-event/rotation.md) | Number | The angle turned since the start of the gesture, in radians |
| | | [`velocity`](../ui-rotation-gesture-recognizer-event/velocity.md) | Number | The speed of rotation, in radians per second |

These values can only be read from the event object: callbacks run later than the gesture, so reading the recognizer afterward does not give the values as they were.

Not cancelable: `preventDefault()` has no effect. The event fires only on the recognizer itself and is not passed to the view or its parent views.
## When it fires

| Recognizer | When it fires |
| --- | --- |
| [`UITapGestureRecognizer`](../ui-tap-gesture-recognizer.md) | When a tap is recognized (measured) |
| [`UISwipeGestureRecognizer`](../ui-swipe-gesture-recognizer.md) | When a swipe is recognized |
| [`UILongPressGestureRecognizer`](../ui-long-press-gesture-recognizer.md) | When the finger lifts after recognition (measured). `location` is where the finger lifted |
| Pan, pinch, rotation, screen-edge pan | When all fingers lift after recognition |

- In the `ended` of a single-finger tap and in the `ended` when a single-finger long press is released, `numberOfTouches` is 1 (measured).
- The `velocity` in a pan's `ended` is the velocity at the moment of release; read it here for a momentum animation. By the time the callback runs the gesture is over, so calling `velocityInView()` again does not get this value.
- Firing for swipe, pan, pinch, rotation, and screen-edge pan is **not verified in the simulator**.

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', (e) => {
  const { location } = e;
  if (location !== null) {
    console.log(location.x, location.y);
  }
});
card.addGestureRecognizer(tap);
```

**Effect**: Tap `card` and the console prints the tap position. Checked in the acceptance tests: a tap 28 pt from the left and 28 pt from the top inside the view gives a `location` of `(28, 28)`.

## Corresponding iOS API

`UIGestureRecognizerStateEnded`. Natively, the action method receives every phase and checks `state` inside the method; here you listen for `'ended'`.

## See also

- [`began`](began-event.md)
- [Discrete and continuous gestures](../ui-gesture-recognizer.md#discrete-and-continuous-gestures)
