---
type: reference
web: MessageEvent
---

# `MessageEvent`

**`MessageEvent`** represents a message that was received.

The [`message`](websocket/message-event.md) event of [`WebSocket`](websocket.md) is one: [`data`](message-event/data.md) is the content of the message, and [`origin`](message-event/origin.md) is the origin of the connection URL.

**Inheritance**: [`Event`](event.md) → `MessageEvent`

## Constructor

[`MessageEvent()`](message-event/constructor.md)

Creates a `MessageEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`data`](message-event/data.md) <small>read-only</small> | The content of the message |
| [`origin`](message-event/origin.md) <small>read-only</small> | The origin of the sender |
| [`lastEventId`](message-event/lasteventid.md) <small>read-only</small> | The ID of the message. Always an empty string in messages the runtime fires |
| [`source`](message-event/source.md) <small>read-only</small> | Always `null` |
| [`ports`](message-event/ports.md) <small>read-only</small> | Always an empty array |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebSocket`](websocket.md) | [`message`](websocket/message-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => ws.send('你好'));
ws.addEventListener('message', (e) => {
  console.log(e instanceof MessageEvent, e.origin, e.data);
});
```

**Effect**: once the connection opens it sends `你好`; when the echo arrives, it prints `true wss://echo.websocket.org` and the content received. The value of `origin` is **not verified in the simulator**.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `MessageEvent` in the browser. A WebSocket message is the system's `NSURLSessionWebSocketMessage`, and its `string` or `data` is the [`data`](message-event/data.md) here.

## See also

- [`WebSocket`](websocket.md): the object that fires this event
- [`message`](websocket/message-event.md): when it is fired
- [Sending and receiving messages with WebSocket](../guides/websocket.md)
