---
type: reference
web: Request.arrayBuffer()
---

# `Request`: `arrayBuffer()` method

The **`arrayBuffer()`** method reads the body given at construction and returns it as an `ArrayBuffer`.

## Syntax

```
arrayBuffer()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with an `ArrayBuffer`. When there's no body, it's an `ArrayBuffer` of 0 bytes.

### Exceptions

The returned `Promise` rejects when the body has already been read:

**`TypeError`**

`Body has already been read`.

## Examples

```js
async function main() {
  const req = new Request('https://httpbin.org/post', {
    method: 'POST',
    body: new Uint8Array([1, 2, 3]),
  });
  const buffer = await req.arrayBuffer();
  console.log(buffer.byteLength);
}
main();
```

**Result**: Prints `3`.

## Differences from the web

Same as on the web.

## See also

- [`arrayBuffer()` of `Response`](../response/arraybuffer.md)
