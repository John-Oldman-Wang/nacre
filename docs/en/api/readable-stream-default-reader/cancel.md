---
type: reference
web: ReadableStreamDefaultReader.cancel()
---

# `ReadableStreamDefaultReader`: `cancel()` method

The **`cancel()`** method says the rest of the content isn't wanted. It has the same effect as the stream's [`cancel()`](../readable-stream/cancel.md); use it while the reader holds the lock.

## Syntax

```
cancel()
cancel(reason)
```

### Parameters

**`reason`**

Any value, optional. Has no effect.

### Return value

A `Promise` that fulfills with `undefined`.

- For streams from `fetch()`: the request stops, and content already downloaded but not read is discarded.
- A pending `read()` fulfills with `{ done: true }` rather than rejecting. Later reads also give `done: true`.

### Exceptions

The returned `Promise` rejects in these cases:

**`TypeError`**

Called after [`releaseLock()`](releaselock.md): `This reader has been released`.

**The exception the stream errored with**

The stream has already errored because the request was canceled or the network dropped.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/bytes/100000');
  if (res.body === null) return;
  const reader = res.body.getReader();
  const first = await reader.read();
  await reader.cancel();
  const next = await reader.read();
  console.log(first.done, next.done);
}
main();
```

**Result**: It prints `false true`. After the first chunk is read, downloading stops.

## Differences from the web

Same as on the web.

## See also

- [`releaseLock()`](releaselock.md)
