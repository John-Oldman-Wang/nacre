---
type: reference
web: WebSocket open event
---

# `WebSocket`: `open` event

The **`open`** event fires when the connection is established. After it fires, messages can be sent and received.

## Syntax

```
ws.addEventListener('open', (event) => { })
```

## Event object

An `Event` with no fields other than `type` and `target`. Cannot be canceled.

## When it fires

- Fires once, when the handshake completes and the connection is established. At that point [`readyState`](readystate.md) is already `1`, and [`protocol`](protocol.md) is already settled.
- A connection that fails does not fire `open`; it fires [`error`](error-event.md) and [`close`](close-event.md) directly. So whether `open` fired tells "failed to connect" apart from "dropped after connecting".
- The callback runs after the current piece of code finishes. A listener added in the same piece of code right after construction does not miss it.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  console.log('Connected');
  ws.send('hello');
});
```

**Effect**: once connected, logs `Connected`, then sends `hello`.

## Differences from the web

Browsers can also listen with `ws.onopen = …`; here there is no `onopen` property, and only `addEventListener` works.

## See also

- [`send()`](send.md)
