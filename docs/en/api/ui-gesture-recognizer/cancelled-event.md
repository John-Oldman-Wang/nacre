---
type: reference
native: UIGestureRecognizerStateCancelled
---

# `UIGestureRecognizer`: `cancelled` event

The **`cancelled`** event fires when a continuous gesture is interrupted.

## Syntax

```
addEventListener('cancelled', (event) => { })
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

- Fires when the app goes to the background during a long press (measured on a device).
- It should also fire when the recognizer's [`isEnabled`](isenabled.md) is set to `false` during a long press; **not verified in the simulator**.
- Taps and swipes do not fire it.
- A gesture that fired `cancelled` does not fire [`ended`](ended-event.md). If you changed the UI during the gesture, restore it here.

## Examples

```js
const card = new UIView();
const press = new UILongPressGestureRecognizer();
press.addEventListener('began', () => {
  card.alpha = 0.6;
});
const restore = () => {
  card.alpha = 1;
};
press.addEventListener('ended', restore);
press.addEventListener('cancelled', restore);
card.addGestureRecognizer(press);
```

**Effect**: Hold `card` for 0.5 seconds and it fades. Releasing, or the long press being interrupted, both restore it to opaque. **The change in opacity is not verified in the simulator.**

## Corresponding iOS API

`UIGestureRecognizerStateCancelled`. Natively, the action method receives every phase and checks `state` inside the method; here you listen for `'cancelled'`.

## See also

- [`ended`](ended-event.md)
- [`isEnabled`](isenabled.md)
