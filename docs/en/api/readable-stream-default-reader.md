---
type: reference
web: ReadableStreamDefaultReader
---

# `ReadableStreamDefaultReader`

**`ReadableStreamDefaultReader`** represents a reader for a [stream](readable-stream.md): it holds the stream's lock and reads chunk by chunk with [`read()`](readable-stream-default-reader/read.md). You get it from [`stream.getReader()`](readable-stream/getreader.md).

A stream has only one reader at a time. After a reader calls [`releaseLock()`](readable-stream-default-reader/releaselock.md) to release the lock, it is no longer usable, and the stream can be given to a new reader, which continues from where the last one left off.

**Inheritance**: `ReadableStreamDefaultReader` doesn't inherit from other classes.

## Constructor

[`ReadableStreamDefaultReader()`](readable-stream-default-reader/constructor.md)

Creates a reader for a stream; same effect as `stream.getReader()`.

## Instance properties

| Property | Description |
| --- | --- |
| [`closed`](readable-stream-default-reader/closed.md) <small>read-only</small> | A `Promise` that fulfills when the stream ends |

## Instance methods

| Method | Description |
| --- | --- |
| [`read()`](readable-stream-default-reader/read.md) | Reads the next chunk |
| [`cancel()`](readable-stream-default-reader/cancel.md) | Discards the rest of the content |
| [`releaseLock()`](readable-stream-default-reader/releaselock.md) | Releases the lock; this reader is no longer usable |

## Concepts

### On errors

| Case | Result |
| --- | --- |
| The request is canceled by `AbortController`, or `AbortSignal.timeout()` runs out | The pending `read()` and all later ones reject with a [`DOMException`](dom-exception.md) whose `name` is `'AbortError'`; `closed` also rejects with it. This holds even when all the content has arrived but hasn't been read yet |
| The network drops mid-download | `read()` rejects with `TypeError`, whose `message` starts with `Network request failed: `; `closed` also rejects with it. Content that arrived before the drop but hasn't been read is no longer given |
| `read()` or `cancel()` is called after `releaseLock()` | The returned `Promise` rejects with `TypeError`; `closed` also rejects with `TypeError` |
| `releaseLock()` is called while a `read()` is pending | That `read()` rejects with `TypeError`. The chunk it was going to read isn't lost; the next reader reads it |

One kind of interruption can't be detected: the response headers have no `Content-Length`, and the server closes the connection normally partway through. The system treats this as the content being complete, and `read()` ends normally after reading the part that has arrived, without an error (measured in the simulator). When you need to confirm the content is complete, have the server provide `Content-Length` and compare it with the bytes read, or include an end marker in the content.

## Examples

```js
async function main() {
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
main();
```

**Result**: After 3 seconds it prints `30`. **Not verified in the simulator.**

## Differences from the web

- When the request is canceled, `read()` rejects with `AbortError`, not `signal.reason`.
- For streams from `fetch()`, `closed` fulfills only after `read()` reaches `done`. The web fulfills it when the content reaches its end.
- When a response without `Content-Length` is truncated and the server closes the connection normally, there is no error. The web reports an error.
- There is no `ReadableStreamBYOBReader`.

## See also

- [`ReadableStream`](readable-stream.md)
- [Reading a response as it downloads](../guides/streaming-response.md)
