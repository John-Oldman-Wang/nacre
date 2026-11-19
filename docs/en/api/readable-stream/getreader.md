---
type: reference
web: ReadableStream.getReader()
---

# `ReadableStream`: `getReader()` method

The **`getReader()`** method returns a [reader](../readable-stream-default-reader.md) and locks the stream.

## Syntax

```
getReader()
```

### Parameters

None.

### Return value

A [`ReadableStreamDefaultReader`](../readable-stream-default-reader.md). Use its `read()` to read one chunk at a time. `new ReadableStreamDefaultReader(stream)` does the same thing.

### Exceptions

**`TypeError`**

- The stream is locked: `This ReadableStream is locked: it already has a reader, or its body has been read`.
- `{ mode }` was passed: `getReader() does not take a mode: BYOB readers are not supported`.

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

**Result**: logs `30` after 3 seconds. **Not verified in the simulator.**

## Differences from the web

`{ mode: 'byob' }` is not supported; passing it throws `TypeError`.

## See also

- [`ReadableStreamDefaultReader`](../readable-stream-default-reader.md)
- [`values()`](values.md): reading with `for await`
