---
type: reference
web: CloseEvent
---

# `CloseEvent`

**`CloseEvent`** represents a connection that has ended.

The [`close`](websocket/close-event.md) event of [`WebSocket`](websocket.md) is one. It carries the close code, the reason the other side gave, and whether the connection ended cleanly.

**Inheritance**: [`Event`](event.md) → `CloseEvent`

## Constructor

[`CloseEvent()`](close-event/constructor.md)

Creates a `CloseEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`code`](close-event/code.md) <small>read-only</small> | The close code: why the connection ended |
| [`reason`](close-event/reason.md) <small>read-only</small> | The reason the other side gave |
| [`wasClean`](close-event/wasclean.md) <small>read-only</small> | Whether both sides completed the close by the protocol |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebSocket`](websocket.md) | [`close`](websocket/close-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => ws.close());
ws.addEventListener('close', (e) => {
  console.log(e instanceof CloseEvent, e.code, e.wasClean);
});
```

**Effect**: the connection closes right after opening, and prints `true 1000 true`. **Not verified in the simulator.**

## Corresponding iOS API

There is no corresponding system API. It corresponds to `CloseEvent` in the browser. A WebSocket connection is the system's `NSURLSessionWebSocketTask`, and its `closeCode` and `closeReason` are the [`code`](close-event/code.md) and [`reason`](close-event/reason.md) here.

## See also

- [`WebSocket`](websocket.md): the object that fires this event
- [`close`](websocket/close-event.md): when it is fired
