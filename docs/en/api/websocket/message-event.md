---
type: reference
web: WebSocket message event
---

# `WebSocket`: `message` event

The **`message`** event fires when a message arrives from the server. It fires once per message.

## Syntax

```
ws.addEventListener('message', (event) => { })
```

## Event object

`WebSocketMessageEvent` in the type definitions. Cannot be canceled. The callback parameter has the generic `Event` type, so cast it before reading `data`; see the example below.

**`data`**

The received content:

- A text message is a string.
- A binary message is a [`Blob`](../fetch.md). `size` is the number of bytes; to read the bytes, use `await data.arrayBuffer()`.

## When it fires

- While the connection is open, it fires once for each message received, continuing until the connection ends.
- Receiving a message larger than [`maximumMessageSize`](maximummessagesize.md) fails. **What fires in that case is not verified in the simulator.**
- A message that arrives before a listener is added is lost; it is not delivered again.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('message', async (e) => {
  const data = /** @type {WebSocketMessageEvent} */ (e).data;
  if (typeof data === 'string') {
    console.log('Text', data);
  } else {
    const bytes = new Uint8Array(await data.arrayBuffer());
    console.log('Binary', bytes.length, 'bytes');
  }
});
```

**Effect**: for a text message, logs its content; for a binary message, logs its byte count.

## Differences from the web

- In browsers, binary messages are `Blob` by default and can be changed to `ArrayBuffer` with `binaryType`; here they are always `Blob`, and there is no `binaryType`.
- The browser's event object is a `MessageEvent` that also carries fields such as `origin` and `lastEventId`; here it carries only `data`.
- There is no `onmessage` property; only `addEventListener` works.

## See also

- [`send()`](send.md)
