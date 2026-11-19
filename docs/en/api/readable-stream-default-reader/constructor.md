---
type: reference
web: ReadableStreamDefaultReader()
---

# `ReadableStreamDefaultReader()` constructor

The **`ReadableStreamDefaultReader()`** constructor creates a reader for a stream and locks the stream. Same effect as [`stream.getReader()`](../readable-stream/getreader.md).

## Syntax

```
new ReadableStreamDefaultReader(stream)
```

### Parameters

**`stream`**

The [`ReadableStream`](../readable-stream.md) to read. Required.

### Return value

A new reader.

### Exceptions

**`TypeError`**

- `stream` isn't a `ReadableStream`: `ReadableStreamDefaultReader needs a ReadableStream`.
- The stream is already locked: `This ReadableStream is locked: it already has a reader, or its body has been read`.

## Examples

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  const reader = new ReadableStreamDefaultReader(res.body);
  const { value } = await reader.read();
  console.log(value);
}
main();
```

**Result**: It prints a `Uint8Array` containing `97, 98, 99`.

## Differences from the web

Same as on the web.

## See also

- [`getReader()`](../readable-stream/getreader.md)
