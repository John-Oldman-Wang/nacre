---
type: reference
native: UIGestureRecognizerEvent
---

# `UIGestureRecognizerEvent`

**`UIGestureRecognizerEvent`** represents an event of a gesture recognizer: a gesture about to begin, beginning, changing, ending, or being canceled.

It carries the gesture position and the number of fingers involved. The `began`, `changed`, `ended`, and `cancelled` events of the pan, pinch, and rotation recognizers are subclasses of it that carry a few more fields: [`UIPanGestureRecognizerEvent`](ui-pan-gesture-recognizer-event.md), [`UIPinchGestureRecognizerEvent`](ui-pinch-gesture-recognizer-event.md), and [`UIRotationGestureRecognizerEvent`](ui-rotation-gesture-recognizer-event.md).

**Inheritance**: [`Event`](event.md) → `UIGestureRecognizerEvent`

## Constructor

[`UIGestureRecognizerEvent()`](ui-gesture-recognizer-event/constructor.md)

Creates a `UIGestureRecognizerEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`location`](ui-gesture-recognizer-event/location.md) <small>read-only</small> | The gesture position, in the coordinate system of the recognizer's view |
| [`numberOfTouches`](ui-gesture-recognizer-event/numberoftouches.md) <small>read-only</small> | The number of fingers in the gesture |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIGestureRecognizer`](ui-gesture-recognizer.md) and all its subclasses | [`beforebegin`](ui-gesture-recognizer/beforebegin-event.md) |
| [`UITapGestureRecognizer`](ui-tap-gesture-recognizer.md), [`UILongPressGestureRecognizer`](ui-long-press-gesture-recognizer.md), [`UISwipeGestureRecognizer`](ui-swipe-gesture-recognizer.md) | [`began`](ui-gesture-recognizer/began-event.md), [`changed`](ui-gesture-recognizer/changed-event.md), [`ended`](ui-gesture-recognizer/ended-event.md), [`cancelled`](ui-gesture-recognizer/cancelled-event.md) |

`beforebegin` can be canceled: `cancelable` is `true`, and calling `preventDefault()` keeps this gesture from beginning. The others can't be canceled.

The `beforebegin` of the pan, pinch, and rotation recognizers is this class too, not a subclass: the gesture hasn't begun, so there is no distance moved, scale, or similar value yet.

## Examples

```js
const page = new UIViewController();
const tap = new UITapGestureRecognizer();
tap.addEventListener('beforebegin', (e) => {
  if (e.location !== null && e.location.y < 100) {
    e.preventDefault();
  }
});
tap.addEventListener('ended', (e) => {
  console.log(e instanceof UIGestureRecognizerEvent, e.location?.y);
});
page.view.addGestureRecognizer(tap);
```

**Effect**: tapping within the top 100 pt of the page keeps the gesture from beginning, and nothing is printed. Tapping elsewhere prints `true` and the y of the tap.

## Corresponding iOS API

A native action method receives the recognizer itself and reads the position and number of fingers from it. Here both are the values at the moment of the event, on the event object.

| ObjC | JS |
| --- | --- |
| `[recognizer locationInView:recognizer.view]` | `event.location` |
| `recognizer.numberOfTouches` | `event.numberOfTouches` |
| Returning `NO` from `gestureRecognizerShouldBegin:` | Calling `preventDefault()` in `beforebegin` |

## See also

- [`UIGestureRecognizer`](ui-gesture-recognizer.md): the object that fires these events
- [Responding to gestures](../guides/gestures.md)
