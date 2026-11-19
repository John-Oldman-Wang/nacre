---
type: reference
web: ReadableStreamDefaultReader.releaseLock()
---

# `ReadableStreamDefaultReader`: `releaseLock()` method

The **`releaseLock()`** method releases the reader's lock on the stream; from then on, this reader is no longer usable.

## Syntax

```
releaseLock()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None. Calling it again has no effect.

## Description

- Afterward you can call `getReader()` on the stream again and continue from where reading left off.
- Afterward, calling `read()` or `cancel()` on this reader returns a `Promise` that rejects with `TypeError`; `closed` also rejects with `TypeError`.
- Called while a `read()` is pending: that `read()` rejects with `TypeError`. The chunk it was going to read isn't lost; the next reader reads it.
- While `res.body` has a reader, the four reading methods of `Response` reject; after `releaseLock()`, the four methods work as usual (provided nothing has been read with `read()` yet).

## Examples

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  const reader = res.body.getReader();
  reader.releaseLock();
  console.log(await res.text());
}
main();
```

**Result**: It prints `abc`.

## Differences from the web

Same as on the web.

## See also

- [`locked` on `ReadableStream`](../readable-stream/locked.md)
