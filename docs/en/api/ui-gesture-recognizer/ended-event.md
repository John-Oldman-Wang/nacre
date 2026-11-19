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

The event object's type is `UIGestureRecognizerEvent`. Besides `type` and `target`, it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `location` | [`CGPoint`](../structs.md) or `null` | The position of the gesture, in the coordinate system of the view the recognizer is attached to, in [pt](../units.md). With several fingers, it is their center point. To convert to another view, use the view's `convertPoint()` |
| `numberOfTouches` | Number | The number of fingers taking part in the gesture when the event occurred |

The event objects of three kinds of recognizer each carry two more read-only fields, all values as of the moment the event occurred:

| Recognizer | Event object type | Field | Type | Meaning |
| --- | --- | --- | --- | --- |
| [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md), [`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md) | `UIPanGestureRecognizerEvent` | `translation` | `CGPoint` | How far the finger has moved from the start of the gesture up to this event, in the coordinate system of the view the recognizer is attached to, in pt |
| | | `velocity` | `CGPoint` | The speed of the finger's movement, in the same coordinate system, in pt per second |
| [`UIPinchGestureRecognizer`](../ui-pinch-gesture-recognizer.md) | `UIPinchGestureRecognizerEvent` | `scale` | Number | The distance between the two fingers as a multiple of the distance at the start of the gesture |
| | | `velocity` | Number | How much `scale` changes per second |
| [`UIRotationGestureRecognizer`](../ui-rotation-gesture-recognizer.md) | `UIRotationGestureRecognizerEvent` | `rotation` | Number | The angle turned since the start of the gesture, in radians |
| | | `velocity` | Number | The speed of rotation, in radians per second |

The callback parameter is declared as `Event`; to read these fields, cast the type, as in the example. These values can only be read from the event object: callbacks run later than the gesture, so reading the recognizer afterward does not give the values as they were.

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
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
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
