---
type: reference
web: ReadableStream
---

# `ReadableStream`

**`ReadableStream`** represents data that can be read out one chunk at a time. It currently has only one source: the [`body`](response/body.md) property of a [`Response`](response.md). Each chunk is a `Uint8Array`.

There are two ways to read a stream: `for await (const chunk of stream)`, or getting a [reader](readable-stream-default-reader.md) with [`getReader()`](readable-stream/getreader.md) and calling `read()` repeatedly. Both **lock** the stream while reading: only one party can read at a time, and getting a reader while it is locked throws.

**Inheritance**: `ReadableStream` does not inherit from any other class.

To read a response while it downloads and show download progress, see the guide [Reading a response as it downloads](../guides/streaming-response.md).

## Constructor

Can't be created with `new`: `new ReadableStream()` throws `TypeError` with a message starting with `ReadableStream cannot be constructed yet`. Get one from [`res.body`](response/body.md).

## Instance properties

| Property | Description |
| --- | --- |
| [`locked`](readable-stream/locked.md) <small>read-only</small> | Whether the stream is locked |

## Instance methods

| Method | Description |
| --- | --- |
| [`getReader()`](readable-stream/getreader.md) | Gets a reader and locks the stream |
| [`values()`](readable-stream/values.md) | Returns an async iterator for `for await` |
| [`[Symbol.asyncIterator]()`](readable-stream/symbol.asynciterator.md) | The same function as `values()`, so a stream can go straight into `for await` |
| [`cancel()`](readable-stream/cancel.md) | Discards the rest of the content and stops the request |

## Concepts

### How `for await` behaves

- The stream is locked during the loop. The lock is released in all three cases: the loop ends normally, exits early with `break`, or the loop body throws.
- An early `break` or `return` cancels the stream and stops the request. To keep the stream and continue reading later, use [`values({ preventCancel: true })`](readable-stream/values.md).
- When reading fails (the request is canceled, the network drops), the exception is thrown from the `for await` line.

### How big a chunk is

The size of a chunk and the number of chunks depend on the network and on how fast the code reads. They have no fixed relation to how much the server sends at a time: content the server sends in two parts may arrive as one chunk, and content sent at once may be split into several chunks. Code can't assume that one chunk is one complete message.

Each `Uint8Array` chunk is an independent copy of the data. It can be modified and kept for later.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('This response has no body');

  let received = 0;
  for await (const chunk of res.body) {
    received += chunk.byteLength;
    console.log('Received', chunk.byteLength, 'bytes, total', received);
  }
  console.log('Done');
}
main();
```

**Result**: this test URL sends 30 bytes gradually over 3 seconds. Several "Received …" lines are logged over those 3 seconds; the total on the last one is `30`, followed by `Done`. **Not verified in the simulator.**

## Differences from the web

- Can't be created with `new`; it only comes from `res.body`.
- No `pipeTo()`, `pipeThrough()`, or `tee()`, and no static method `ReadableStream.from()`.
- `getReader({ mode: 'byob' })` throws `TypeError`; this kind of reader is not supported.

## See also

- [`ReadableStreamDefaultReader`](readable-stream-default-reader.md): the reader
- [`body` of `Response`](response/body.md): where the stream comes from
- [Reading a response as it downloads](../guides/streaming-response.md)
