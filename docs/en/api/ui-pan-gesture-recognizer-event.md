---
type: reference
native: UIPanGestureRecognizerEvent
---

# `UIPanGestureRecognizerEvent`

**`UIPanGestureRecognizerEvent`** represents an event of a pan gesture: beginning, moving, ending, or being canceled.

On top of [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md), it carries how far the finger has moved and how fast.

**Inheritance**: [`Event`](event.md) → [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) → `UIPanGestureRecognizerEvent`

## Constructor

[`UIPanGestureRecognizerEvent()`](ui-pan-gesture-recognizer-event/constructor.md)

Creates a `UIPanGestureRecognizerEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits [`location`](ui-gesture-recognizer-event/location.md) and [`numberOfTouches`](ui-gesture-recognizer-event/numberoftouches.md) from [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md), and the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`translation`](ui-pan-gesture-recognizer-event/translation.md) <small>read-only</small> | How far the finger has moved since the gesture began |
| [`velocity`](ui-pan-gesture-recognizer-event/velocity.md) <small>read-only</small> | How fast the finger is moving |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md), [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md) | [`began`](ui-gesture-recognizer/began-event.md), [`changed`](ui-gesture-recognizer/changed-event.md), [`ended`](ui-gesture-recognizer/ended-event.md), [`cancelled`](ui-gesture-recognizer/cancelled-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. All the values are the ones at the moment the event happened: the callback runs later than the gesture, so the recognizer no longer has those values.

## Examples

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', (e) => {
  console.log(e instanceof UIPanGestureRecognizerEvent, e.translation.x, e.velocity.x);
});
card.addGestureRecognizer(drag);
```

**Effect**: while dragging on `card`, each move prints `true`, the horizontal distance, and the horizontal speed.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[recognizer translationInView:recognizer.view]` | `event.translation` |
| `[recognizer velocityInView:recognizer.view]` | `event.velocity` |

## See also

- [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md): the object that fires these events
- [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md): the parent class
