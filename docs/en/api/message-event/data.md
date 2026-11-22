---
type: reference
web: MessageEvent.data
---

# `MessageEvent`: `data` property

The **`data`** property is the content of the message.

## Value

In a [`WebSocket`](../websocket.md) message:

- Read-only. Assigning to it throws `TypeError`.
- A text message is a string.
- A binary message is a [`Blob`](../blob.md). `size` is the number of bytes; to read the bytes, use `await data.arrayBuffer()`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('message', async (e) => {
  if (typeof e.data === 'string') {
    console.log('文本', e.data);
  } else {
    const bytes = new Uint8Array(await e.data.arrayBuffer());
    console.log('二进制', bytes.length);
  }
});
```

**Effect**: a text message prints `文本` and its content; a binary message prints `二进制` and its number of bytes.

## Corresponding iOS API

`string` or `data` of `NSURLSessionWebSocketMessage`.

## See also

- [`MessageEvent`](../message-event.md)
- [`message`](../websocket/message-event.md)
