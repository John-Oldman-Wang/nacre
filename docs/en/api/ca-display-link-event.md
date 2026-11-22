---
type: reference
native: CADisplayLinkEvent
---

# `CADisplayLinkEvent`

**`CADisplayLinkEvent`** represents one frame of screen refresh.

The [`tick`](ca-display-link/tick-event.md) event of [`CADisplayLink`](ca-display-link.md) is this class, and [`frame`](ca-display-link-event/frame.md) carries three times for the frame.

**Inheritance**: [`Event`](event.md) → `CADisplayLinkEvent`

## Constructor

[`CADisplayLinkEvent()`](ca-display-link-event/constructor.md)

Creates a `CADisplayLinkEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`frame`](ca-display-link-event/frame.md) <small>read-only</small> | Three times for this frame |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`CADisplayLink`](ca-display-link.md) | [`tick`](ca-display-link/tick-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const link = new CADisplayLink();
link.addEventListener('tick', (e) => {
  console.log(e instanceof CADisplayLinkEvent, e.frame.duration);
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Effect**: each frame prints `true` and the interval between frames, about `0.0083` on a 120 Hz screen.

## Corresponding iOS API

A native callback method receives the `CADisplayLink` itself and reads the times from it. Here they are this frame's values, on the event object.

| ObjC | JS |
| --- | --- |
| `link.timestamp` | `event.frame.timestamp` |
| `link.duration` | `event.frame.duration` |
| `link.targetTimestamp` | `event.frame.targetTimestamp` |

## See also

- [`CADisplayLink`](ca-display-link.md): the object that fires this event
- [Running code every frame](../guides/frame-callback.md)
