---
type: reference
native: UIRotationGestureRecognizerEvent
---

# `UIRotationGestureRecognizerEvent`

**`UIRotationGestureRecognizerEvent`** represents an event of a rotation gesture: beginning, changing, ending, or being canceled.

On top of [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md), it carries the angle turned and the rotation speed.

**Inheritance**: [`Event`](event.md) → [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) → `UIRotationGestureRecognizerEvent`

## Constructor

[`UIRotationGestureRecognizerEvent()`](ui-rotation-gesture-recognizer-event/constructor.md)

Creates a `UIRotationGestureRecognizerEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits [`location`](ui-gesture-recognizer-event/location.md) and [`numberOfTouches`](ui-gesture-recognizer-event/numberoftouches.md) from [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md), and the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`rotation`](ui-rotation-gesture-recognizer-event/rotation.md) <small>read-only</small> | The angle turned since the gesture began |
| [`velocity`](ui-rotation-gesture-recognizer-event/velocity.md) <small>read-only</small> | The rotation speed |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIRotationGestureRecognizer`](ui-rotation-gesture-recognizer.md) | [`began`](ui-gesture-recognizer/began-event.md), [`changed`](ui-gesture-recognizer/changed-event.md), [`ended`](ui-gesture-recognizer/ended-event.md), [`cancelled`](ui-gesture-recognizer/cancelled-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. All the values are the ones at the moment the event happened: the callback runs later than the gesture, so the recognizer no longer has those values.

## Examples

```js
const dial = new UIView();
const turn = new UIRotationGestureRecognizer();
turn.addEventListener('changed', (e) => {
  console.log(e instanceof UIRotationGestureRecognizerEvent, (e.rotation * 180 / Math.PI).toFixed(0));
});
dial.addGestureRecognizer(turn);
```

**Effect**: while turning on `dial`, prints `true` and the number of degrees turned.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `recognizer.rotation` | `event.rotation` |
| `recognizer.velocity` | `event.velocity` |

## See also

- [`UIRotationGestureRecognizer`](ui-rotation-gesture-recognizer.md): the object that fires these events
- [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md): the parent class
