---
type: reference
web: WebSocket.send()
---

# `WebSocket`: `send()` method

The **`send()`** method sends a message over the connection. A string is sent as a text message; the other types are sent as binary messages.

## Syntax

```
send(data)
```

### Parameters

**`data`**

The content to send:

| Type | Sent as |
| --- | --- |
| String | A text message |
| [`Blob`](../fetch.md), `ArrayBuffer`, typed array (such as `Uint8Array`) | A binary message |

How large a single message can be is **not verified in the simulator**.

### Return value

A Promise. Fulfills with `true` once the message has been handed to the network to send. It does not wait for the server to acknowledge it: fulfillment does not mean the server has received it.

When the Promise is rejected, the error object's `name` tells the reason:

| `name` | `message` | When |
| --- | --- | --- |
| `InvalidStateError` | `send: the socket is not open` | The connection is not open: it is still connecting, closing, or has ended |
| `InvalidStateError` | `send: expects a string or a Blob` | `data` is not one of the types in the table above |
| `NetworkError` | The system's error description | A network error occurred while sending |

### Exceptions

Does not throw directly. All errors are reported by rejecting the returned Promise.

## Description

A message sent with `send()` before the connection is open is not held and sent after connecting. Put content that should be sent as soon as the connection opens in the [`open`](open-event.md) callback.

## Examples

### Sending text and binary

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  ws.send('text').then(() => console.log('Sent'));
  ws.send(new Uint8Array([1, 2, 3, 4, 5]));
});
```

**Result**: once connected, a text message is sent first and `Sent` is logged; then a 5-byte binary message is sent.

### Sending before connecting

```js
const early = new WebSocket('wss://echo.websocket.org');
early.send('too early').catch((err) => {
  console.log(err.name, err.message);
});
```

**Result**: logs `InvalidStateError send: the socket is not open`.

## Differences from the web

- The browser's `send()` has no return value; here it returns a Promise.
- In browsers, calling `send()` before the connection is open throws immediately; here the returned Promise is rejected.

## See also

- [`message` event](message-event.md): receiving messages
- [`Blob`](../fetch.md)
