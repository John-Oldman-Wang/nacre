---
type: reference
web: WebSocket.OPEN
---

# `WebSocket.OPEN` static property

The **`WebSocket.OPEN`** static property is one of the values of [`readyState`](readystate.md), with the value `1`: the connection is established, and messages can be sent and received. This stage is entered when [`open`](open-event.md) fires.

## Value

A number, `1`.

- Read-only. Assigning to it throws `TypeError`.
- It never changes.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(WebSocket.OPEN, ws.readyState === WebSocket.OPEN);
```

**Result**: the console logs `1`, followed by whether the connection is in this stage right now. A connection that was just constructed is in `CONNECTING`.

## Differences from the web

The value is the same as on the web. Browsers also have this constant on instances (`ws.OPEN`); here it exists only on `WebSocket`, and reading it on an instance gives `undefined`.

## See also

- [The four stages of a connection](../websocket.md#the-four-stages-of-a-connection)
