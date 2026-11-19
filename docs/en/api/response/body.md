---
type: reference
web: Response.body
---

# `Response`: `body` property

The **`body`** property is a stream of the response body, for reading it chunk by chunk before it has finished downloading.

## Value

A [`ReadableStream`](../readable-stream.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.
- Each chunk is a `Uint8Array`.
- `null` when the response has no body: responses to `HEAD` requests, responses with status 204, 205, or 304, and a [`new Response()`](constructor.md) without a `body`. So check before using it.
- A `Response` you create yourself also has a stream as `body`, delivering the content in one chunk.

`body` and the four reading methods read the same content and exclude each other; for the rules, see [The body can be read only once](../response.md#the-body-can-be-read-only-once). Only accessing the `body` property, without getting a reader, has no effect.

### Memory

- When reading is slower than downloading, unread content accumulates in memory up to about 1 MB, then the request pauses, and resumes automatically once the content is read. See [Slow reading pauses the request](../../guides/streaming-response.md#slow-reading-pauses-the-request).
- If you never read after getting the `Response`, the download continues as usual and the whole content stays in memory. Pausing happens only after you start reading with `read()`.
- When you no longer need the rest of the content, call [`cancel()`](../readable-stream/cancel.md) or `break` out of `for await`, and the request stops immediately. A stream abandoned partway is also stopped when it is reclaimed, but when that happens isn't certain, so don't rely on it.

## Examples

### Reading with `for await`

```js
async function main() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('This response has no body');

  let received = 0;
  for await (const chunk of res.body) {
    received += chunk.byteLength;
  }
  console.log(received);
}
main();
```

**Result**: This test URL sends 30 bytes gradually over 3 seconds. After 3 seconds it prints `30`. **Not verified in the simulator.**

### A response you created yourself

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) throw new Error('No body');
  const reader = res.body.getReader();
  const first = await reader.read();
  const second = await reader.read();
  console.log(first.value, second.done);
}
main();
```

**Result**: It prints a `Uint8Array` containing `97, 98, 99`, and `true`.

## Differences from the web

- For streams from `fetch()`, buffering is limited only after you start reading with `read()`. The web limits it even when you aren't reading, and the download stops to wait.
- For responses without `Content-Length`, when the server closes the connection normally partway through, there is no error: reading ends normally after the part that has arrived. The web reports an error.

## See also

- [`ReadableStream`](../readable-stream.md): the stream's members
- [Reading a response as it downloads](../../guides/streaming-response.md): patterns for large files, download progress, and server push
