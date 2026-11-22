---
type: reference
web: MessageEvent.origin
---

# `MessageEvent`: `origin` property

The **`origin`** property is the origin of the sender: scheme, host, and port.

## Value

A string. In a [`WebSocket`](../websocket.md) message, it is the origin of the connection URL; for example, `'wss://echo.websocket.org'` for a connection to `wss://echo.websocket.org/chat`.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org/chat');
ws.addEventListener('message', (e) => {
  console.log(e.origin);
});
```

**Effect**: for each message, prints `wss://echo.websocket.org`. **Not verified in the simulator.**

## Corresponding iOS API

There is no corresponding system API. It is computed from the connection URL.

## See also

- [`MessageEvent`](../message-event.md)
