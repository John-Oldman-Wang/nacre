---
type: reference
web: CloseEvent.wasClean
---

# `CloseEvent`: `wasClean` property

The **`wasClean`** property tells whether both sides completed the close according to the protocol.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- `true`: the closing handshake completed.
- `false`: the connection dropped, for example because the network went away.
- When the event is created with [`new`](constructor.md) without it, it is `false`.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('close', (e) => {
  if (!e.wasClean) {
    console.log('连接断了，稍后重连');
  }
});
```

**Effect**: when the connection ends abnormally, prints `连接断了，稍后重连`.

## Corresponding iOS API

There is no corresponding system API. It comes from whether the connection received a close frame.

## See also

- [`CloseEvent`](../close-event.md)
