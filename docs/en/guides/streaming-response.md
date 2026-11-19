# Reading a response as it downloads

This guide covers how to use [`body`](../api/response/body.md) on [`Response`](../api/response.md) to read the content chunk by chunk before it has finished downloading: handling large files, showing download progress, and reading text the server keeps pushing. The classes involved are [`ReadableStream`](../api/readable-stream.md) and [`ReadableStreamDefaultReader`](../api/readable-stream-default-reader.md). For the basics of sending requests, see [Fetching data from the network](fetch.md).

The examples below are all written inside `async` functions.

## Recommended approach

- **For ordinary APIs, read the whole body with methods such as `json()` and `text()`.** That is the simplest.
- **Read as it downloads with `res.body` in these three cases**: the content is large and you don't want it all in memory; you need to show download progress; the server never ends the response.
- **Read with `for await`.** The lock is released automatically when the loop ends, on `break`, and on an exception; on `break` the request stops automatically. Use `getReader()` yourself only when you need to read the same stream in several places.
- **When you no longer need the rest of the content, `break` or call `cancel()`.** A stream abandoned partway is also stopped when it is reclaimed, but when that happens isn't certain; don't rely on it.

You can use either `body` or the four methods that read the whole body, not both; for the rules, see [The body can be read only once](../api/response.md#the-body-can-be-read-only-once).

## Processing while downloading

`res.body` is a stream of the response body. Iterate it with `for await`, and the loop body runs once for each chunk that arrives.

```js
async function drip() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('This response has no body');

  let received = 0;
  for await (const chunk of res.body) {
    received += chunk.byteLength;
    console.log('Received', chunk.byteLength, 'bytes, total', received);
  }
  console.log('Done reading');
}
```

**Result**: This test URL sends 30 bytes gradually over 3 seconds. Several "Received …" lines are printed over 3 seconds, the total on the last one is `30`, and then `Done reading` is printed. **Not verified in the simulator.**

- Each `chunk` is a `Uint8Array`. It is an independent copy of the data; you can modify it or keep it for later.
- How big a chunk is and how many chunks there are depend on the network and how fast you read; they have no fixed relationship to how much the server sends at a time. Code can't assume one chunk is one complete message.
- You can `await` inside the loop body. When processing is slow, unread content accumulates first, and if too much accumulates the request pauses; see [Slow reading pauses the request](#slow-reading-pauses-the-request).
- `break` or `return` from the loop cancels the request immediately, and downloading stops.
- For a response without a body, `res.body` is `null`, so check first.

Without `for await`, get a reader yourself and read; the effect is the same:

```js
async function dripWithReader() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('This response has no body');

  const reader = res.body.getReader();
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
  }
  console.log(received);
}
```

**Result**: After 3 seconds it prints `30`. **Not verified in the simulator.** `read()` fulfills when the next chunk arrives; after the whole body has been read, `done` is `true` and `value` is `undefined`.

## Showing download progress

There is no dedicated progress API. When the server gives the total byte count in the `Content-Length` response header, divide the bytes read so far by it.

```js
async function progress() {
  const res = await fetch('https://httpbin.org/bytes/100000');
  if (!res.ok || res.body === null) throw new Error('Download failed');

  // Without this header, Number(null) is 0
  const total = Number(res.headers.get('content-length'));
  /** @type {Uint8Array[]} */
  const parts = [];
  let received = 0;
  for await (const chunk of res.body) {
    parts.push(chunk);
    received += chunk.byteLength;
    if (total > 0) console.log(Math.round((received / total) * 100) + '%');
  }
  const blob = new Blob(parts);
  console.log(blob.size);
}
```

**Result**: During the download it prints several lines of increasing percentages, the last being `100%`, then prints `100000`. **Not verified in the simulator.**

- Not every response has `Content-Length`. Responses the server sends while generating them don't have this header; then no percentage can be calculated, and you can only show the bytes downloaded so far.
- Whether `Content-Length` still matches the bytes read when the server compresses the content (gzip) is **not verified in the simulator**.
- The example stores each chunk in an array and joins them into a `Blob` at the end, so the whole file is still in memory. To save memory, process each chunk inside the loop instead of keeping it.
- You don't need to update the interface as often as chunks arrive. When chunks come densely, updating once in a while is enough.

## Reading text the server keeps pushing

Some APIs don't return everything at once; they keep the connection open and send a line whenever there is something new. Such a response never ends, so it can only be read as it downloads. The code below splits the arriving content into lines at newlines.

```js
async function lines() {
  const controller = new AbortController();
  const res = await fetch('https://httpbin.org/stream/5', { signal: controller.signal });
  if (res.body === null) throw new Error('This response has no body');

  const decoder = new TextDecoder();
  let rest = '';
  for await (const chunk of res.body) {
    // stream: true: when the bytes of one character are split across two chunks, keep them for the next chunk
    rest += decoder.decode(chunk, { stream: true });
    const parts = rest.split('\n');
    // The last piece hasn't reached a newline yet; keep it for the next chunk
    rest = parts.pop() ?? '';
    for (const line of parts) {
      if (line !== '') console.log(JSON.parse(line).id);
    }
  }
}
```

**Result**: This test URL sends 5 lines of JSON and then ends. It prints `0`, `1`, `2`, `3`, `4` in order. **Not verified in the simulator.**

- The end of a chunk isn't necessarily the end of a line, or even the end of a character. So an incomplete half line stays in `rest`, and an incomplete half character is held by [`TextDecoder`](../api/text-decoder.md). If you only handle English letters and digits, you can skip it: look for newlines by byte (`10`), then convert to a string with `String.fromCharCode()`.
- When the server never ends the response, the loop doesn't end by itself. To stop, call `controller.abort()` (the loop throws `AbortError`), or `break` inside the loop.
- **`await fetch()` doesn't return until the first chunk of the body arrives**, not when the headers arrive. When the server has nothing to send for a long time after connecting, `fetch()` doesn't return. Have the server send a little content (such as an empty line) right after the headers, and `fetch()` returns immediately; `if (line !== '')` in the example skips exactly that. See [The response arrives in two steps](#the-response-arrives-in-two-steps).
- The runtime doesn't parse the `text/event-stream` format, and there is no `EventSource`. Its messages are also newline-separated text, which you can split yourself as above.
- When the response type is `text/plain` without `X-Content-Type-Options: nosniff`, the system waits until it has 512 bytes before handing anything over, so the first few short messages arrive late. See the table in the next section.

## The response arrives in two steps

`await fetch()` returns when the status code, headers, and **first chunk of the response body** arrive; the rest of the content may still be downloading then. The `Promise` returned by the four reading methods doesn't complete until the whole body has downloaded.

```js
async function twoSteps() {
  const res = await fetch('https://httpbin.org/get');   // The headers and first chunk have arrived
  console.log(res.status);                               // Available immediately
  const data = await res.json();                         // This waits for the body to download
  console.log(data.url);
}
```

**Result**: It prints `200`, and after the body has downloaded, prints `https://httpbin.org/get`.

So you can look at the status code and headers first, then decide whether to read the body. If you decide not to, cancel the request with `AbortController`.

`fetch()` doesn't return when the headers arrive. After receiving the headers, iOS's networking library holds them until the first byte of the body arrives, then hands over the headers together with that byte. Measured: when a test service sent the headers and waited 700 milliseconds before sending the body, `fetch()` returned between 704 and 720 milliseconds, the same moment the first chunk arrived. All numbers in this section were measured in the iOS 27.2 simulator; **not verified on a device**.

For most requests this makes no difference: the server sends the body right after the headers. The difference shows up with APIs where the server sends the headers first and the body only after a while, such as APIs that keep the connection open and push only when there is a message:

- Until the first message arrives, `fetch()` doesn't return, and code can't get the status code, so it can't tell "connected and waiting for messages" from "not connected yet".
- A connection timeout set with `AbortSignal.timeout()` also counts the time spent waiting for the first message.

**The way to make `fetch()` return immediately is on the server side: right after sending the headers, send a little content — even one byte — then wait for messages.** `fetch()` returns as soon as that content arrives. Measured: sending 1 byte first, `fetch()` returned in 2 to 6 milliseconds. What you send is read as the first chunk of the stream, so choose something the reading side can skip: an empty line for text split into lines, or a comment line starting with a colon for `text/event-stream`.

For one kind of response 1 byte isn't enough: type `text/plain` without the `X-Content-Type-Options: nosniff` response header. The system then uses the first part of the content to determine what type it really is, and hands nothing over until it has 512 bytes: `fetch()` doesn't return, and content that has already arrived can't be read. The `nosniff` header tells the system not to make that determination.

| Response `Content-Type` | How much content must be sent first before `fetch()` returns | Measured |
| --- | --- | --- |
| `text/event-stream`, `application/octet-stream` (with `nosniff`) | 1 byte | Sending 1 byte first: returned in 6 ms and 2 ms |
| `text/plain`, with `X-Content-Type-Options: nosniff` | 1 byte | Sending 1 byte first: returned in 5 ms |
| `text/plain`, without `nosniff` | 512 bytes | Sending 1 byte first: returned only after 708 ms, arriving as one chunk together with a second byte sent 700 ms later. Sending 512 bytes first: returned in 4 ms |

So for APIs that push text, use a response type like `text/event-stream`, or include `nosniff`, and send a little content right after the headers.

For `application/json` and `text/html` responses (without `nosniff`), sending 1 byte first is enough; this was measured with native code on macOS and is **not verified in the simulator**.

Responses without a body (the response to a `HEAD` request, status 204) return when the response ends and aren't affected.

## Slow reading pauses the request

When reading with `res.body`, downloading and reading are two separate things: content first arrives in the runtime, and is handed to JS only when your code calls `read()`. When your code reads more slowly than it downloads, unread content accumulates in memory.

When about 1 MB has accumulated, the runtime pauses the request and stops receiving from the network; after the next `read()` takes the accumulated content, the request resumes automatically. So no matter how large the file or how slowly you read, unread content uses memory on that order and doesn't keep growing. Pausing and resuming need nothing from your code, and there are no events for them.

- While paused, the server can't send data, and the connection stays open. Measured in the simulator: after reading one chunk and then not reading, the test service could send a little more and then couldn't send any further; on reading again, the content continued from where it stopped rather than starting over. The exact numbers were measured with native code on macOS: after pausing at 1 MB, data stopped arriving immediately, and the server stalled after sending about 1.4 MB more.
- The system doesn't count timeouts while paused (per iOS documentation; **not verified in the simulator**). The server itself may drop the connection if it can't send for a long time; then `read()` rejects.
- A chunk you take may be fairly large. However much has accumulated, the next `read()` gives it all at once.
- Pausing happens only after you start reading with `read()`. If you never read after getting the `Response`, or you read the whole body with the four reading methods, there is no pausing, and the whole content stays in memory.

## Confirming the content is complete

One kind of interruption can't be detected: the response headers have no `Content-Length`, and the server closes the connection normally partway through. The system treats this as the content being complete, and `read()` ends normally after reading the part that has arrived, without an error (measured in the simulator). When you need to confirm the content is complete, have the server provide `Content-Length` and compare it with the bytes read, or include an end marker in the content.

## See also

- [`ReadableStream`](../api/readable-stream.md), [`ReadableStreamDefaultReader`](../api/readable-stream-default-reader.md)
- [`body` on `Response`](../api/response/body.md)
- [Fetching data from the network](fetch.md)
- [WebSocket](../api/websocket.md): use it when you need a two-way, persistent connection
