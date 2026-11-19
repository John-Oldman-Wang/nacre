---
type: reference
web: ReadableStream.locked
---

# `ReadableStream`: `locked` property

The **`locked`** property indicates whether the stream is locked. A locked stream can't hand out another reader.

## Value

A boolean.

- `true`: a reader holds it, or it is being iterated by `for await`, or its `Response` has already been read in full by one of the four body-reading methods.
- `false`: not locked; you can call [`getReader()`](getreader.md) or put it in `for await`.
- Read-only. Assigning to it throws `TypeError`.
- It has no change event: the lock is taken by your own code. It goes back to `false` when the reader calls `releaseLock()` or the `for await` loop ends.

## Examples

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  console.log(res.body.locked);
  const reader = res.body.getReader();
  console.log(res.body.locked);
  reader.releaseLock();
  console.log(res.body.locked);
}
main();
```

**Result**: logs `false`, `true`, `false` in order.

## Differences from the web

Same as the web.

## See also

- [`getReader()`](getreader.md)
