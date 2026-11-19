---
type: reference
web: WebSocket.close()
---

# `WebSocket`: `close()` method

The **`close()`** method closes the connection. It returns immediately, and the [`close`](close-event.md) event fires when closing completes.

## Syntax

```
close()
close(code)
close(code, reason)
```

### Parameters

**`code`**

Optional. The close code, an integer: converted with `Number(v)` and truncated toward zero. When omitted or `null`, `1000` (normal closure) is used. For common codes, see the [`close` event](close-event.md#close-codes).

**`reason`**

Optional. An explanation for the server, a string. When omitted, no explanation is sent.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`code` does not convert to a finite number: `code must be a finite number, got …`.

## Description

- After the call, [`readyState`](readystate.md) becomes `2` immediately. When closing completes, `close` fires and `readyState` becomes `3`; the event's `code` is the code given here, and `wasClean` is `true`.
- Calling it again while the connection is closing or has ended does nothing and does not throw.
- When called while the connection is still connecting, `readyState` becomes `2`. Which events fire after that is **not verified in the simulator**.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  ws.close(1000, 'bye');
  console.log(ws.readyState === WebSocket.CLOSING);
});
ws.addEventListener('close', (e) => {
  console.log(/** @type {WebSocketCloseEvent} */ (e).code);
});
```

**Result**: once connected, logs `true`; when closing completes, logs `1000`.

## Differences from the web

Browsers restrict `code`: only `1000` or `3000` to `4999` are accepted; anything else throws `InvalidAccessError`. Here the range is not checked, and any integer is passed to the system to send. How the server handles a code outside that range is **not verified in the simulator**.

## See also

- [`close` event](close-event.md)
