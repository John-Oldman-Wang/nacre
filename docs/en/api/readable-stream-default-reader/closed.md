---
type: reference
web: ReadableStreamDefaultReader.closed
---

# `ReadableStreamDefaultReader`: `closed` property

The **`closed`** property is a `Promise` that fulfills when the stream ends and rejects when it errors.

## Value

A `Promise`.

- Read-only; assigning to it throws `TypeError`.
- Fulfills with `undefined` when the stream ends.
- Rejects when reading errors, with the same exception as [`read()`](read.md).
- Rejects with `TypeError` after [`releaseLock()`](releaselock.md).
- A stream from `fetch()` only knows it has ended when `read()` reaches `done`, so waiting on `closed` alone without calling `read()` never finishes.

## Examples

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  const reader = res.body.getReader();
  reader.closed.then(() => console.log('Ended'));
  while (!(await reader.read()).done) { /* Read to the end */ }
}
main();
```

**Result**: After reading reaches `done`, it prints `Ended`.

## Differences from the web

For streams from `fetch()`, `closed` fulfills only after `read()` reaches `done`. The web fulfills it when the content reaches its end.

## See also

- [`read()`](read.md)
