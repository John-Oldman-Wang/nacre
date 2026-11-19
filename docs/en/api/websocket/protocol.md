---
type: reference
web: WebSocket.protocol
---

# `WebSocket`: `protocol` property

The **`protocol`** property is the subprotocol the server selected. Subprotocols are the application-level protocol names proposed with `protocols` at construction.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- Before the connection is established, it is an empty string `''`.
- After the connection is established, it is the one the server picked from `protocols`; if the server picked none, it is an empty string. **The value after connecting is not verified in the simulator.**
- It is settled when [`open`](open-event.md) fires and does not change afterward.

## Examples

```js
const ws = new WebSocket('wss://example.com/chat', { protocols: ['chat.v2', 'chat.v1'] });
ws.addEventListener('open', () => {
  console.log(ws.protocol);
});
```

**Result**: once connected, logs the subprotocol the server selected, for example `chat.v2`. **Not verified in the simulator.**

## Differences from the web

The same as on the web. The way subprotocols are given at construction differs; see [`WebSocket()`](constructor.md#differences-from-the-web).

## See also

- [`WebSocket()`](constructor.md): `options.protocols`
