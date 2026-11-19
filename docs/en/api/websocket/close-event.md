---
type: reference
web: WebSocket close event
---

# `WebSocket`: `close` event

The **`close`** event fires when the connection ends. However the connection ends, it fires at the end, exactly once.

## Syntax

```
ws.addEventListener('close', (event) => { })
```

## Event object

`WebSocketCloseEvent` in the type definitions. Cannot be canceled.

**`code`**

A number: the close code, which says why the connection ended. See [Close codes](#close-codes) below.

**`reason`**

A string: the explanation given by the other side. An empty string if there is none.

**`wasClean`**

A boolean. `true` means both sides completed the closing handshake according to the protocol; `false` means the connection ended abnormally.

## When it fires

- After the app calls [`close()`](close.md), when closing completes.
- When the server closes the connection. **Not verified in the simulator.**
- When the connection fails, or drops partway through, right after [`error`](error-event.md).
- When it fires, [`readyState`](readystate.md) is already `3`. After it fires, the runtime no longer keeps this `WebSocket` alive.
- A dropped connection does not reconnect automatically. To reconnect, create a new `WebSocket` in this event's callback.

### Close codes

| `wasClean` | `code` | Meaning |
| --- | --- | --- |
| `true` | The code given when the app called `close()`; `1000` by default | The app closed the connection, and both sides completed the closing handshake |
| `true` | The code sent by the server | The server closed the connection. **Not verified in the simulator** |
| `false` | `1006` | The connection failed, or dropped partway through. `1006` is not sent by the server; the device fills it in when the connection ends abnormally |

Common codes: `1000` is a normal closure, `1001` means one side is going away (for example, the server is shutting down), `1008` means a server policy was violated, `1009` means a message was too big, and `1011` means an internal server error. `4000` to `4999` are reserved for applications to define; check the server's documentation for their meaning.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('close', (e) => {
  const { code, reason, wasClean } = /** @type {WebSocketCloseEvent} */ (e);
  if (wasClean) {
    console.log('Closed cleanly', code, reason);
  } else {
    console.log('Connection dropped', code);
  }
});
```

**Effect**: when both sides complete the closing handshake, logs `Closed cleanly` followed by the close code and reason. When the connection ends abnormally, logs `Connection dropped 1006`.

## Differences from the web

- There is no `onclose` property; only `addEventListener` works.
- The `code`, `reason`, and `wasClean` fields of the event object are the same as on the web.

## See also

- [`close()`](close.md)
- [Keeping a long-lived connection](../../guides/websocket.md#keeping-a-long-lived-connection): reconnect here
