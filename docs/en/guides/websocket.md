# Sending and receiving messages with WebSocket

This guide covers how to keep a long-lived connection to a server with [`WebSocket`](../api/websocket.md): connecting, sending and receiving text and binary data, sending and receiving JSON, closing, and automatically reconnecting after a disconnect and checking the connection periodically. The details of each member are on the [`WebSocket`](../api/websocket.md) reference page.

## Recommended approach

- **Add listeners right after constructing.** Event callbacks run after the current piece of code finishes, so constructing first and adding listeners later in the same piece of code is safe. Do not wait until `open` to add the `message` listener: messages fired when there is no listener are lost.
- **Put the first message to send in the `open` callback.** Calling `send()` before connecting rejects the Promise, and the message is not kept to be sent after connecting.
- **Put cleanup code only in the `close` callback.** However the connection ends, `close` fires once at the end, and only once.
- **For connections used for a long time, handle reconnecting and checking yourself.** A connection does not reconnect automatically after it drops. Check periodically with `ping()`, and after a disconnect, reconnect after an interval that grows each time; see [Keeping a long-lived connection](#keeping-a-long-lived-connection).

## The first connection

The following code connects to a public service that echoes messages back, sends a text message, and closes the connection after receiving the reply. It needs no interface and runs when written directly at the top level of `main.js`.

```js
// 1. Open the connection. It is not connected yet when this line returns
const ws = new WebSocket('wss://echo.websocket.org');

// 2. Send a message once connected
ws.addEventListener('open', () => {
  console.log('Connected');
  ws.send('hello');
});

// 3. Receive messages
ws.addEventListener('message', (e) => {
  const data = /** @type {WebSocketMessageEvent} */ (e).data;
  console.log('Received', data);

  // 4. Close after receiving the message we sent
  if (data === 'hello') ws.close(1000, 'bye');
});

// 5. Errors and the end
ws.addEventListener('error', (e) => {
  console.log('Error', /** @type {WebSocketErrorEvent} */ (e).message);
});
ws.addEventListener('close', (e) => {
  const { code, wasClean } = /** @type {WebSocketCloseEvent} */ (e);
  console.log('Ended', code, wasClean);
});
```

**Effect**

- Once connected, prints `Connected`.
- The server sends `hello` back, and it prints `Received hello`. This service may first send a welcome message of its own when you connect; that one is printed too.
- After the close completes, prints `Ended 1000 true`.
- When it cannot connect, prints `Error` followed by a system error description, then `Ended 1006 false`.

The callbacks' parameter type is the generic `Event`; to read fields such as `data`, `message`, and `code`, cast it once, which is what `/** @type {...} */ (e)` above does.

This code has not been run as a whole in the simulator. Every API it uses has been run against the same service in the acceptance tests.

The examples below reuse `ws` from here and assume the connection is open.

## Sending text

```js
ws.send('text').then(() => {
  console.log('Sent');
});
```

**Effect**: Prints `Sent` after the message is sent. The Promise fulfilling means the message has been handed to the network for sending, not that the server has received it.

## Sending binary data

```js
ws.send(new Uint8Array([1, 2, 3, 4, 5]));
```

**Effect**: The server receives a 5-byte binary message. `ArrayBuffer`, typed arrays, and [`Blob`](../api/fetch.md) are all sent as binary messages.

## Telling text from binary in received messages

```js
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

**Effect**: Text messages print their content. Binary messages print their byte count.

The `data` of a text message is a string; the `data` of a binary message is a `Blob`. The `Blob`'s `size` is the byte count; to read the bytes, use `await data.arrayBuffer()`.

## Sending and receiving JSON

```js
ws.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));

ws.addEventListener('message', (e) => {
  const data = /** @type {WebSocketMessageEvent} */ (e).data;
  if (typeof data !== 'string') return;
  try {
    const msg = JSON.parse(data);
    console.log(msg.type);
  } catch (err) {
    console.log('Not JSON');
  }
});
```

**Effect**: Sends a JSON text message. Each text message received is parsed as JSON, and its `type` is printed. **This example is not verified in the simulator.**

## Wanting to send before connecting

Calling `send()` before the connection is open rejects the Promise, and the message is not kept to be sent after connecting. Put what you want to send in the `open` callback:

```js
const early = new WebSocket('wss://echo.websocket.org');

early.send('too early').catch((err) => {
  console.log(err.name, err.message);
});

early.addEventListener('open', () => {
  early.send('Now it works');
});
```

**Effect**: First prints `InvalidStateError send: the socket is not open`. After connecting, the second message is sent normally.

## Checking whether the connection still works

```js
ws.ping().then(
  () => console.log('Connection OK'),
  (err) => console.log('Connection down', err.message),
);
```

**Effect**: After the server responds, prints `Connection OK`. When the connection is down, prints `Connection down` followed by the error description; **this case is not verified in the simulator**.

[`ping()`](../api/websocket/ping.md) sends a protocol-level probe frame, which the server's WebSocket implementation answers automatically; the server's application code does not need to cooperate.

## Closing the connection

```js
ws.close(1000, 'bye');
console.log(ws.readyState === WebSocket.CLOSING);
```

**Effect**: Prints `true`. `close()` returns immediately, and `readyState` becomes `2`. After the close completes, `close` fires and `readyState` becomes `3`; the event's `code` is `1000` and `wasClean` is `true`.

## Understanding why it closed

```js
ws.addEventListener('close', (e) => {
  const { code, reason, wasClean } = /** @type {WebSocketCloseEvent} */ (e);
  if (wasClean) {
    console.log('Closed normally', code, reason);
  } else {
    console.log('Connection lost', code);
  }
});
```

**Effect**: When both sides complete the close by the protocol, prints `Closed normally` with the close code and reason. When the connection ends abnormally, prints `Connection lost 1006`. For the meaning of each close code, see [the `close` event](../api/websocket/close-event.md#close-codes).

## Sending a sign-in token with the handshake

The constructor's second argument can include `headers`; these request headers are sent to the server with the handshake request:

```js
const authed = new WebSocket('wss://example.com/quotes', {
  headers: { Authorization: 'Bearer abc123' },
});
```

**Effect**: The handshake request carries the `Authorization` header. **That the header actually reaches the server is not verified in the simulator**: the public service used for acceptance does not echo headers.

`headers` must be a plain object, with every value a string. Entries whose value is not a string are ignored, with no error. Passing a `Headers` object has no effect.

## Keeping a long-lived connection

For a connection used for a long time, you must handle two things yourself: check the connection periodically with `ping()`, and reconnect after an interval when it drops. Below is a minimal version.

```js
/**
 * Keep a connection open: reconnect when it drops, and probe every 30 seconds.
 * @param {string} url
 * @param {(data: string | Blob) => void} onMessage
 */
function keepConnected(url, onMessage) {
  let attempts = 0;
  let stopped = false;
  /** @type {WebSocket | null} */
  let current = null;

  function open() {
    const socket = new WebSocket(url);
    current = socket;
    /** @type {number | undefined} */
    let heartbeat;

    socket.addEventListener('open', () => {
      attempts = 0;
      // If a probe fails, close it ourselves and let the close callback reconnect
      heartbeat = setInterval(() => {
        socket.ping().catch(() => socket.close());
      }, 30000);
    });

    socket.addEventListener('message', (e) => {
      onMessage(/** @type {WebSocketMessageEvent} */ (e).data);
    });

    // However it ended, it always ends up here
    socket.addEventListener('close', () => {
      clearInterval(heartbeat);
      if (stopped) return;
      // The reconnect interval doubles each time: 1 s, 2 s, 4 s… up to 30 s
      const delay = Math.min(30000, 1000 * 2 ** attempts);
      attempts += 1;
      setTimeout(open, delay);
    });
  }

  open();

  return {
    stop() {
      stopped = true;
      if (current) current.close();
    },
  };
}

const connection = keepConnected('wss://example.com/quotes', (data) => {
  console.log('Received', data);
});
```

**Effect**: Once the connection is established, each message received prints one line. After the connection ends, a new connection is created automatically after an interval that starts at 1000 milliseconds and doubles each time, up to 30000 milliseconds, starting again from 1000 milliseconds after connecting. After `connection.stop()` is called, the connection is closed and is not reconnected.

This code is **not verified in the simulator**. These points have not been verified:

- That `ping()` really rejects when the connection is down, and how long it takes to reject.
- That after calling `close()` on a failed probe, the `close` event really fires.
- Whether this logic works correctly after the app returns from the background.

A few notes:

- **The reconnect interval must grow each time.** When the server has a failure, all clients reconnecting at a fixed short interval make it harder for it to recover.
- **Resubscribe after reconnecting.** The new connection has nothing to do with the old one; messages such as sign-in and subscriptions must be sent again in the new connection's `open`.
- **Probe with `ping()`, not a heartbeat message of your own.** `ping()` needs no cooperation from the server's application code. If the server requires the client to send some application message periodically, send it separately as the server requires.

## After the app goes into the background

Whether the connection is kept after the app goes into the background, whether it is still usable on returning to the foreground, and whether messages the server sends in the meantime are lost are **not verified in the simulator**.

The system suspends an app a short while after it goes into the background; this comes from iOS's definition. Given that, on returning to the foreground, treat the connection as possibly dropped: listen for `close` and reconnect, or check once with `ping()` in the `foreground` event of [`application`](../api/application.md).

## See also

- [`WebSocket`](../api/websocket.md): all properties, methods, and events
- [`fetch`](../api/fetch.md): for one request and one response; the description of `Blob` is also there
- [Timers](../api/timers.md): `setInterval`, `setTimeout`
- [`application`](../api/application.md): the `foreground` event
