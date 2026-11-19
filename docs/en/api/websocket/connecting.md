---
type: reference
web: WebSocket.CONNECTING
---

# `WebSocket.CONNECTING` static property

The **`WebSocket.CONNECTING`** static property is one of the values of [`readyState`](readystate.md), with the value `0`: the connection is connecting, and messages cannot be sent yet. A connection is in this stage right after construction.

## Value

A number, `0`.

- Read-only. Assigning to it throws `TypeError`.
- It never changes.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(WebSocket.CONNECTING, ws.readyState === WebSocket.CONNECTING);
```

**Result**: the console logs `0`, followed by whether the connection is in this stage right now. A connection that was just constructed is in `CONNECTING`.

## Differences from the web

The value is the same as on the web. Browsers also have this constant on instances (`ws.CONNECTING`); here it exists only on `WebSocket`, and reading it on an instance gives `undefined`.

## See also

- [The four stages of a connection](../websocket.md#the-four-stages-of-a-connection)
