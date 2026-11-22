---
type: reference
web: Response.text()
---

# `Response`: `text()` method

The **`text()`** method reads the whole response body and decodes it as UTF-8 into a string.

## Syntax

```
text()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with a string once the whole body has downloaded.

- It always decodes as UTF-8, ignoring the encoding declared in the response headers. For text in other encodings, read the bytes with [`arrayBuffer()`](arraybuffer.md) and decode them yourself.
- When the content isn't valid UTF-8, it gives the empty string `''` without an error.
- A response without a body gives the empty string.

### Exceptions

The returned `Promise` rejects in these cases:

**`TypeError`**

- The body has already been read: `Body has already been read`.
- [`body`](body.md) has a reader: `Body is locked: response.body has a reader`.
- The network drops mid-download: `message` starts with `Network request failed: `.

**A [`DOMException`](../dom-exception.md) whose `name` is `'AbortError'`**

The request is canceled mid-download, or `AbortSignal.timeout()` runs out.

## Description

Decoding happens in the background, so decoding large text doesn't freeze the interface. Besides the downloaded copy, it creates a string.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/range/16');
  const text = await res.text();
  console.log(text);
}
main();
```

**Result**: It prints `abcdefghijklmnop`.

## Differences from the web

The web decodes using the encoding the response declares and replaces invalid bytes with the replacement character. Nacre always decodes as UTF-8 and gives an empty string when the bytes are invalid.

## See also

- [`json()`](json.md)
- [Choosing among the four ways to read](../response.md#choosing-among-the-four-ways-to-read)
