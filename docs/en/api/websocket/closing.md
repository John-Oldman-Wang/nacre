---
type: reference
web: WebSocket.CLOSING
---

# `WebSocket.CLOSING` static property

The **`WebSocket.CLOSING`** static property is one of the values of [`readyState`](readystate.md), with the value `2`: the connection is closing. This stage is entered after [`close()`](close.md) is called.

## Value

A number, `2`.

- Read-only. Assigning to it throws `TypeError`.
- It never changes.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(WebSocket.CLOSING, ws.readyState === WebSocket.CLOSING);
```

**Result**: the console logs `2`, followed by whether the connection is in this stage right now. A connection that was just constructed is in `CONNECTING`.

## Differences from the web

The value is the same as on the web. Browsers also have this constant on instances (`ws.CLOSING`); here it exists only on `WebSocket`, and reading it on an instance gives `undefined`.

## See also

- [The four stages of a connection](../websocket.md#the-four-stages-of-a-connection)
