---
type: reference
native: UIGestureRecognizerStateBegan
---

# `UIGestureRecognizer`: `began` event

The **`began`** event fires the moment a continuous gesture is recognized.

## Syntax

```
addEventListener('began', (event) => { })
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
| [`UILongPressGestureRecognizer`](../ui-long-press-gesture-recognizer.md) | When the finger has been held for `minimumPressDuration`, 0.5 seconds by default (measured) |
| [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md), [`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md) | When the finger touches down and moves a short distance |
| [`UIPinchGestureRecognizer`](../ui-pinch-gesture-recognizer.md), [`UIRotationGestureRecognizer`](../ui-rotation-gesture-recognizer.md) | When a two-finger pinch or rotation is recognized |
| [`UITapGestureRecognizer`](../ui-tap-gesture-recognizer.md), [`UISwipeGestureRecognizer`](../ui-swipe-gesture-recognizer.md) | Never. They fire only [`ended`](ended-event.md) |

- Once per gesture. It is followed by zero or more [`changed`](changed-event.md) events, and finally [`ended`](ended-event.md) or [`cancelled`](cancelled-event.md).
- Does not fire when the gesture is not recognized. For example, a long press lifted before the time is up, or a finger that moves more than `allowableMovement` before the time is up.
- Firing for pan, pinch, rotation, and screen-edge pan is **not verified in the simulator**.

## Examples

```js
const card = new UIView();
const press = new UILongPressGestureRecognizer();
press.addEventListener('began', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location !== null) {
    console.log('Held down', location.x, location.y);
  }
});
card.addGestureRecognizer(press);
```

**Effect**: Hold `card` for 0.5 seconds and the console prints `Held down` followed by the finger's coordinates within `card`.

## Corresponding iOS API

`UIGestureRecognizerStateBegan`. Natively, the action method receives every phase and checks `state` inside the method; here you listen for `'began'`.

## See also

- [`changed`](changed-event.md), [`ended`](ended-event.md), [`cancelled`](cancelled-event.md)
- [Discrete and continuous gestures](../ui-gesture-recognizer.md#discrete-and-continuous-gestures)
