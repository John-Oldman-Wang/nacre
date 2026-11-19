---
type: reference
web: ReadableStream.values()
---

# `ReadableStream`: `values()` method

The **`values()`** method returns an async iterator for reading the stream one chunk at a time with `for await`, and locks the stream.

## Syntax

```
values()
values({ preventCancel })
```

### Parameters

**`options.preventCancel`**

A boolean; optional; defaults to `false`.

- `false`: exiting the loop early (`break`, `return`, a thrown exception) cancels the stream and stops the request.
- `true`: exiting the loop early only releases the lock and doesn't cancel the stream. You can continue reading afterward.

### Return value

An async iterator. Each step yields one `Uint8Array` chunk; iteration ends when the stream has been read to the end.

### Exceptions

**`TypeError`**

The stream is locked: `This ReadableStream is locked: it already has a reader, or its body has been read`.

## Examples

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  for await (const chunk of res.body.values({ preventCancel: true })) {
    console.log(chunk.byteLength);
    break;
  }
  console.log(res.body.locked);
}
main();
```

**Result**: logs `3` and `false`. After `break` the stream is not canceled, and the lock has been released.

## Differences from the web

Same as the web.

## See also

- [`[Symbol.asyncIterator]()`](symbol.asynciterator.md)
- [How `for await` behaves](../readable-stream.md#how-for-await-behaves)
