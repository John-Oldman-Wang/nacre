---
type: reference
native: UIGestureRecognizerStateChanged
---

# `UIGestureRecognizer`: `changed` event

The **`changed`** event fires while a continuous gesture is in progress and the fingers move.

## Syntax

```
addEventListener('changed', (event) => { })
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

- For long press, pan, pinch, rotation, and screen-edge pan, it fires once each time the fingers move after [`began`](began-event.md).
- After a long press is recognized, holding still fires no `changed` at all; moving the finger in four steps while holding gives 4 `changed` events (measured).
- Taps and swipes do not fire it.

## Examples

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
let start = card.center;
drag.addEventListener('began', () => {
  start = card.center;
});
drag.addEventListener('changed', (e) => {
  const { translation } = e;
  card.center = new CGPoint(start.x + translation.x, start.y + translation.y);
});
card.addGestureRecognizer(drag);
```

**Effect**: Hold `card` and move your finger: `card` follows the finger. On release it stays where it was released. **Not verified in the simulator.**

## Corresponding iOS API

`UIGestureRecognizerStateChanged`. Natively, the action method receives every phase and checks `state` inside the method; here you listen for `'changed'`.

## See also

- [`began`](began-event.md), [`ended`](ended-event.md)
- [Responding to gestures](../../guides/gestures.md#dragging-a-view)
