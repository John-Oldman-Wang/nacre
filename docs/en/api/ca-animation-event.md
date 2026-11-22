---
type: reference
native: CAAnimationEvent
---

# `CAAnimationEvent`

**`CAAnimationEvent`** represents an animation that has stopped: it played to the end, or was removed partway.

The [`stop`](ca-animation/stop-event.md) event of [`CAAnimation`](ca-animation.md) is this class, and [`finished`](ca-animation-event/finished.md) tells which case it was. The `start` event is a plain [`Event`](event.md).

**Inheritance**: [`Event`](event.md) → `CAAnimationEvent`

## Constructor

[`CAAnimationEvent()`](ca-animation-event/constructor.md)

Creates a `CAAnimationEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`finished`](ca-animation-event/finished.md) <small>read-only</small> | Whether the animation played to the end or was removed partway |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`CAAnimation`](ca-animation.md) and its subclasses | [`stop`](ca-animation/stop-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const dot = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.duration = 0.3;
fade.addEventListener('stop', (e) => {
  console.log(e instanceof CAAnimationEvent, e.finished);
});
dot.addAnimation(fade, { forKey: 'fade' });
```

**Effect**: when the animation finishes, prints `true true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `animationDidStop:finished:` | The `stop` event |
| The `flag` parameter | `event.finished` |

## See also

- [`CAAnimation`](ca-animation.md): the object that fires this event
- [`stop`](ca-animation/stop-event.md): when it is fired
