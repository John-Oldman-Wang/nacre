---
type: reference
web: WebSocket
native: NSURLSessionWebSocketTask
status: partial
---

# `WebSocket`

**`WebSocket`** represents a persistent connection between the app and a server. Once established, the connection stays open, and either side can send the other a message at any time, without a request-and-response exchange. Use it for live quotes, chat, and server push; when one request gets one response, use [`fetch`](fetch.md).

A connection is created with `new WebSocket(url)`. When the constructor returns, the connection is not yet established; it immediately starts connecting in the background and reports the outcome through events: [`open`](websocket/open-event.md) fires when it connects, [`message`](websocket/message-event.md) when a message arrives, [`error`](websocket/error-event.md) on an error, and [`close`](websocket/close-event.md) when the connection ends.

The URL scheme is `wss:` (encrypted) or `ws:` (unencrypted).

**Inheritance**: [`EventTarget`](event-target.md) → `WebSocket`

`WebSocket` cannot be subclassed; see [Native classes](native-classes.md). For how to keep a long-lived connection and send and receive different kinds of messages, see the guide [Sending and receiving messages with WebSocket](../guides/websocket.md).

## Constructor

[`WebSocket()`](websocket/constructor.md)

Creates a connection and starts connecting immediately. Request headers can be added to the handshake request.

## Static properties

Four constants, the four possible values of [`readyState`](websocket/readystate.md):

| Constant | Description |
| --- | --- |
| [`WebSocket.CONNECTING`](websocket/connecting.md) <small>read-only</small> | `0`: connecting |
| [`WebSocket.OPEN`](websocket/open.md) <small>read-only</small> | `1`: connected |
| [`WebSocket.CLOSING`](websocket/closing.md) <small>read-only</small> | `2`: closing |
| [`WebSocket.CLOSED`](websocket/closed.md) <small>read-only</small> | `3`: ended |

## Instance properties

| Property | Description |
| --- | --- |
| [`url`](websocket/url.md) <small>read-only</small> | The URL of the connection |
| [`readyState`](websocket/readystate.md) <small>read-only</small> | The stage the connection is in |
| [`protocol`](websocket/protocol.md) <small>read-only</small> | The subprotocol the server selected |
| [`maximumMessageSize`](websocket/maximummessagesize.md) | The maximum size of a single received message, in bytes |

## Instance methods

Also inherits `addEventListener()`, `removeEventListener()`, and `dispatchEvent()` from `EventTarget`.

| Method | Description |
| --- | --- |
| [`send()`](websocket/send.md) | Sends a text or binary message. Returns a Promise |
| [`ping()`](websocket/ping.md) | Checks whether the connection is still alive. Returns a Promise |
| [`close()`](websocket/close.md) | Closes the connection |

## Events

Listen with `addEventListener()`. There are no properties such as `onopen` or `onmessage`.

| Event | When it fires |
| --- | --- |
| [`open`](websocket/open-event.md) | The connection is established |
| [`message`](websocket/message-event.md) | A message arrives |
| [`error`](websocket/error-event.md) | The connection failed, or dropped partway through. Always followed by a `close` |
| [`close`](websocket/close-event.md) | The connection ended. Fires only once per connection |

The event object of `message` is a [`MessageEvent`](message-event.md), of `error` an [`ErrorEvent`](error-event.md), of `close` a [`CloseEvent`](close-event.md), and of `open` a plain [`Event`](event.md). None of the four events can be canceled. Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

Event callbacks all run after the current piece of code finishes (see [How the runtime works](how-it-works.md)), so adding listeners right after `new WebSocket()` does not miss any event. An event that fires before a listener is added is lost; it is not delivered again.

## The four stages of a connection

[`readyState`](websocket/readystate.md) gives the stage the connection is in right now:

| `readyState` | Constant | Meaning | When it is entered |
| --- | --- | --- | --- |
| `0` | `WebSocket.CONNECTING` | Connecting; messages cannot be sent yet | After construction |
| `1` | `WebSocket.OPEN` | Connected; messages can be sent and received | When `open` fires |
| `2` | `WebSocket.CLOSING` | Closing | After `close()` is called |
| `3` | `WebSocket.CLOSED` | Ended | When `close` fires |

A connection goes through these four stages only once. After it ends, it cannot be reopened; to connect again, create a new `WebSocket`.

## How a connection ends

- **The app calls `close()`**: both sides complete the closing handshake according to the protocol, `close` fires, and `wasClean` is `true`.
- **The server closes the connection**: `close` fires, and `code` is the code the server sent. **Not verified in the simulator.**
- **The connection fails, or drops after it was established**: `error` fires first, then `close`, with `code` `1006` and `wasClean` `false`. Whether `open` fired tells these two cases apart.

However the connection ends, `close` fires at the end, exactly once. **A dropped connection does not reconnect automatically.**

Until the connection ends, the runtime keeps the `WebSocket` object alive. Even if the app's code does not keep a reference to it, the connection keeps working and events keep firing. After `close` fires, the runtime no longer keeps it.

## Examples

### Send a message and close after the reply

The code below connects to a public service that echoes messages back, sends one text message, and closes the connection after the reply arrives. It needs no UI and runs as-is at the top level of `main.js`.

```js
const ws = new WebSocket('wss://echo.websocket.org');

ws.addEventListener('open', () => {
  console.log('Connected');
  ws.send('hello');
});

ws.addEventListener('message', (e) => {
  const data = e.data;
  console.log('Received', data);
  if (data === 'hello') ws.close(1000, 'bye');
});

ws.addEventListener('error', (e) => {
  console.log('Error', e.message);
});
ws.addEventListener('close', (e) => {
  const { code, wasClean } = e;
  console.log('Closed', code, wasClean);
});
```

**Effect**

- Once connected, logs `Connected`.
- The server sends `hello` back, and `Received hello` is logged. This service may first send a welcome message of its own when the connection opens; that one is logged too.
- When closing completes, logs `Closed 1000 true`.
- If the connection fails, logs `Error` followed by a system error description, then `Closed 1006 false`.

This code has not been run as a whole in the simulator. Each API it uses has been run against the same service in the acceptance tests.

For more patterns, see the guide [Sending and receiving messages with WebSocket](../guides/websocket.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[session webSocketTaskWithRequest:req]` plus `[task resume]` | `new WebSocket(url, { headers })` |
| `[task sendMessage:msg completionHandler:]` | `await ws.send(data)` |
| `[task receiveMessageWithCompletionHandler:]`, called again after each message | `message` event, fires continuously |
| `[task sendPingWithPongReceiveHandler:]` | `await ws.ping()` |
| `[task cancelWithCloseCode:reason:]` | `ws.close(code, reason)` |
| `task.maximumMessageSize` | `ws.maximumMessageSize` |
| `URLSession:webSocketTask:didOpenWithProtocol:` | `open` event |
| `URLSession:webSocketTask:didCloseWithCode:reason:` | `close` event with `wasClean` `true` |
| `URLSession:task:didCompleteWithError:` | `error` event plus `close` event with `code` `1006` |

`NSURLSessionWebSocketTask` itself cannot be used directly from JS.

## Differences from the web

The name and most members are the same as the browser's `WebSocket`. The differences:

| Case | Browser | Here |
| --- | --- | --- |
| Second constructor argument | A subprotocol string or array | An object: `{ headers, protocols }`; see [`WebSocket()`](websocket/constructor.md) |
| Custom request headers on the handshake | Not possible | Possible, with `headers` |
| [`ping()`](websocket/ping.md) | None | Available |
| [`maximumMessageSize`](websocket/maximummessagesize.md) | None | Available |
| Return value of [`send()`](websocket/send.md) | None | A Promise |
| Calling `send()` before the connection is open | Throws | The returned Promise is rejected |
| `data` of a binary message | A `Blob` by default; `binaryType` can change it to `ArrayBuffer` | Always a `Blob` |
| Properties such as `onopen` | Available | None |
| `error` event | Carries no reason | Carries `message` |
| `bufferedAmount`, `extensions`, `binaryType` | Available | None |
| Constants such as `ws.OPEN` on instances | Available | None; only on `WebSocket` |
| `readyState` values and the four constants' values | Numbers | The same |

## See also

- [Sending and receiving messages with WebSocket](../guides/websocket.md): text, binary, JSON, reconnecting, heartbeats, the app returning to the foreground
- [`fetch`](fetch.md): when one request gets one response; `Blob` is also described there
- [Timers](timers.md): `setInterval` and `setTimeout`, used for heartbeats and reconnecting
- [`application`](application.md): the `foreground` event, when the app returns to the foreground
- [`URL`](url.md): building and checking connection URLs
- [How the runtime works](how-it-works.md): when event callbacks run
