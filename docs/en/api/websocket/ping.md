---
type: reference
native: "-[NSURLSessionWebSocketTask sendPingWithPongReceiveHandler:]"
---

# `WebSocket`: `ping()` method

The **`ping()`** method sends a protocol-level ping frame to the server and waits for the reply, to confirm that a connection whose [`readyState`](readystate.md) is `1` is actually still alive right now.

The protocol requires the server to reply to a ping frame. The server's WebSocket implementation sends the reply automatically; the server's application code does not need to do anything.

## Syntax

```
ping()
```

### Parameters

None.

### Return value

A Promise. Fulfills with `true` when the server's reply arrives.

If the connection is not alive, the Promise is rejected; the error object's `name` is `NetworkError` and its `message` is the system's error description. **The rejection when the connection is not alive, and how long it takes to reject, are not verified in the simulator.**

### Exceptions

Does not throw directly. What happens when it is called before the connection is open is **not verified in the simulator**.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  ws.ping().then(
    () => console.log('Connection is alive'),
    (err) => console.log('Connection is down', err.message),
  );
});
```

**Result**: when the server replies, logs `Connection is alive`. When the connection is not alive, logs `Connection is down` followed by the error description; **this case is not verified in the simulator**.

## Differences from the web

The web has no such method. A browser `WebSocket` cannot send a ping frame on the page's initiative.

## See also

- [Keeping a long-lived connection](../../guides/websocket.md#keeping-a-long-lived-connection): checks periodically with `ping()`
