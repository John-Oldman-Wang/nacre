---
type: reference
web: ReadableStreamDefaultReader.read()
---

# `ReadableStreamDefaultReader`: `read()` method

The **`read()`** method reads the next chunk from the stream.

## Syntax

```
read()
```

### Parameters

None.

### Return value

A `Promise`:

- When there is data, it gives `{ done: false, value }`, where `value` is a `Uint8Array`.
- After the whole body has been read, it gives `{ done: true, value: undefined }`.
- When there is no data yet, it waits until there is.
- It gives everything that has accumulated at once: when reading is slow, a chunk you take may be fairly large.

You can call `read()` again without waiting for the previous call to complete; results are given in call order.

### Exceptions

The returned `Promise` rejects in these cases:

**An `Error` whose `name` is `'AbortError'`**

The request is canceled by `AbortController`, or `AbortSignal.timeout()` runs out. The pending `read()` and all later ones reject. This holds even when all the content has arrived but hasn't been read yet.

**`TypeError`**

- The network drops mid-download: `message` starts with `Network request failed: `. Content that arrived before the drop but hasn't been read is no longer given.
- Called after [`releaseLock()`](releaselock.md): `This reader has been released`.
- The reader called `releaseLock()` while waiting. The chunk it was going to read isn't lost; the next reader reads it.

## Description

After the first call to `read()`, the request pauses when reading is slower than downloading; see [Slow reading pauses the request](../../guides/streaming-response.md#slow-reading-pauses-the-request).

## Examples

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  const reader = res.body.getReader();
  const first = await reader.read();
  const second = await reader.read();
  console.log(first.value, second.done);
}
main();
```

**Result**: It prints a `Uint8Array` containing `97, 98, 99`, and `true`.

## Differences from the web

When the request is canceled, it rejects with `AbortError`. On the web it rejects with `signal.reason`.

## See also

- [`ReadableStreamDefaultReader`](../readable-stream-default-reader.md#on-errors)
