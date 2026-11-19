---
type: reference
web: Response.arrayBuffer()
---

# `Response`: `arrayBuffer()` method

The **`arrayBuffer()`** method reads the whole response body and gives an `ArrayBuffer`.

## Syntax

```
arrayBuffer()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with an `ArrayBuffer` once the whole body has downloaded. A response without a body gives an `ArrayBuffer` of 0 bytes.

### Exceptions

The returned `Promise` rejects in these cases:

**`TypeError`**

- The body has already been read: `Body has already been read`.
- [`body`](body.md) has a reader: `Body is locked: response.body has a reader`.
- The network drops mid-download: `message` starts with `Network request failed: `.

**An `Error` whose `name` is `'AbortError'`**

The request is canceled mid-download, or `AbortSignal.timeout()` runs out.

## Description

Use it when you process binary data byte by byte yourself; it creates no string. When you only pass the result to another API (making an image, writing a file), use [`blob()`](blob.md), whose content doesn't enter JS memory.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/range/256');
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  console.log(buffer.byteLength, bytes[0]);
}
main();
```

**Result**: It prints `256 97`. `97` is the code for the letter `a`.

## Differences from the web

Same as on the web.

## See also

- [`blob()`](blob.md)
- [Choosing among the four ways to read](../response.md#choosing-among-the-four-ways-to-read)
