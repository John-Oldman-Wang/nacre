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
