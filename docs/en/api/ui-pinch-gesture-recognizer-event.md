---
type: reference
native: UIPinchGestureRecognizerEvent
---

# `UIPinchGestureRecognizerEvent`

**`UIPinchGestureRecognizerEvent`** represents an event of a pinch gesture: beginning, changing, ending, or being canceled.

On top of [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md), it carries the scale and its speed.

**Inheritance**: [`Event`](event.md) → [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) → `UIPinchGestureRecognizerEvent`

## Constructor

[`UIPinchGestureRecognizerEvent()`](ui-pinch-gesture-recognizer-event/constructor.md)

Creates a `UIPinchGestureRecognizerEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits [`location`](ui-gesture-recognizer-event/location.md) and [`numberOfTouches`](ui-gesture-recognizer-event/numberoftouches.md) from [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md), and the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`scale`](ui-pinch-gesture-recognizer-event/scale.md) <small>read-only</small> | The distance between the two fingers relative to the start of the gesture |
| [`velocity`](ui-pinch-gesture-recognizer-event/velocity.md) <small>read-only</small> | How much `scale` changes per second |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIPinchGestureRecognizer`](ui-pinch-gesture-recognizer.md) | [`began`](ui-gesture-recognizer/began-event.md), [`changed`](ui-gesture-recognizer/changed-event.md), [`ended`](ui-gesture-recognizer/ended-event.md), [`cancelled`](ui-gesture-recognizer/cancelled-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. All the values are the ones at the moment the event happened: the callback runs later than the gesture, so the recognizer no longer has those values.

## Examples

```js
const photo = new UIView();
const pinch = new UIPinchGestureRecognizer();
pinch.addEventListener('changed', (e) => {
  console.log(e instanceof UIPinchGestureRecognizerEvent, e.scale.toFixed(2));
});
photo.addGestureRecognizer(pinch);
```

**Effect**: while pinching on `photo`, prints `true` and the current scale.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `recognizer.scale` | `event.scale` |
| `recognizer.velocity` | `event.velocity` |

## See also

- [`UIPinchGestureRecognizer`](ui-pinch-gesture-recognizer.md): the object that fires these events
- [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md): the parent class
