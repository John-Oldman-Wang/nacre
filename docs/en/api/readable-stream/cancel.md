---
type: reference
web: ReadableStream.cancel()
---

# `ReadableStream`: `cancel()` method

The **`cancel()`** method signals that the rest of the content is not wanted. A stream that comes from `fetch()` stops the request.

## Syntax

```
cancel()
cancel(reason)
```

### Parameters

**`reason`**

Any value; optional. It has no effect.

### Return value

A `Promise` that fulfills with `undefined`.

- For a stream from `fetch()`: the request stops, and content that was downloaded but not yet read is discarded.
- Reading afterward gives `done: true`.
- After the call, [`bodyUsed`](../response/bodyused.md) on the owning `Response` is `true`.

### Exceptions

The returned `Promise` is rejected in these cases:

**`TypeError`**

The stream is locked: `Cannot cancel a ReadableStream that is locked`. To cancel in that case, use [`cancel()`](../readable-stream-default-reader/cancel.md) on the reader that holds the lock.

**The exception the stream errored with**

The stream has already errored because the request was canceled or the network dropped.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/bytes/100000');
  console.log(res.status);
  if (res.body !== null) await res.body.cancel();
  console.log(res.bodyUsed);
}
main();
```

**Result**: logs `200` and `true`. The rest of the content is no longer downloaded.

## Differences from the web

Same as the web.

## See also

- [`cancel()` of `ReadableStreamDefaultReader`](../readable-stream-default-reader/cancel.md)
