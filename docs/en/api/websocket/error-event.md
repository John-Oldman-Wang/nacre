---
type: reference
web: WebSocket error event
---

# `WebSocket`: `error` event

The **`error`** event fires when the connection fails, or drops after it was established. It is always followed by a [`close`](close-event.md).

## Syntax

```
ws.addEventListener('error', (event) => { })
```

## Event object

[`ErrorEvent`](../error-event.md), carrying only `message`: `filename` is an empty string, `lineno` and `colno` are `0`, and `error` is `undefined`. Cannot be canceled.

**[`message`](../error-event/message.md)**

A string: the error description given by the system. It is human-readable text in the language of the system settings; do not base decisions on it.

## When it fires

- The connection fails: the host does not exist, there is no network, or the server rejects the handshake.
- The connection drops after it was established.
- Both cases fire the same event. Whether `open` fired tells them apart: if it never fired, the connection failed.
- `close` fires right after, with `code` `1006` and `wasClean` `false`. Cleanup code only needs to go in the `close` callback.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
let opened = false;
ws.addEventListener('open', () => { opened = true; });
ws.addEventListener('error', (e) => {
  const reason = e.message;
  console.log(opened ? 'Dropped' : 'Failed to connect', reason);
});
```

**Effect**: when the connection errors, logs `Failed to connect` or `Dropped`, followed by the system's error description.

## Differences from the web

- The browser's `error` event carries no reason; here it carries `message`.
- There is no `onerror` property; only `addEventListener` works.

## See also

- [`close` event](close-event.md)
