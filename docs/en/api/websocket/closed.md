---
type: reference
web: WebSocket.CLOSED
---

# `WebSocket.CLOSED` static property

The **`WebSocket.CLOSED`** static property is one of the values of [`readyState`](readystate.md), with the value `3`: the connection has ended and can no longer send or receive. This stage is entered when [`close`](close-event.md) fires.

## Value

A number, `3`.

- Read-only. Assigning to it throws `TypeError`.
- It never changes.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(WebSocket.CLOSED, ws.readyState === WebSocket.CLOSED);
```

**Result**: the console logs `3`, followed by whether the connection is in this stage right now. A connection that was just constructed is in `CONNECTING`.

## Differences from the web

The value is the same as on the web. Browsers also have this constant on instances (`ws.CLOSED`); here it exists only on `WebSocket`, and reading it on an instance gives `undefined`.

## See also

- [The four stages of a connection](../websocket.md#the-four-stages-of-a-connection)
