---
type: reference
web: Response.json()
---

# `Response`: `json()` method

The **`json()`** method reads the whole response body, decodes it as UTF-8, and parses it as JSON.

## Syntax

```
json()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with the parsed value once the whole body has downloaded.

### Exceptions

The returned `Promise` rejects in these cases:

**`SyntaxError`**

The content isn't valid JSON. A response without a body gives an empty string, which isn't valid JSON, so it also gets this exception.

**`TypeError`**

- The body has already been read: `Body has already been read`.
- [`body`](body.md) has a reader: `Body is locked: response.body has a reader`.
- The network drops mid-download: `message` starts with `Network request failed: `.

**An `Error` whose `name` is `'AbortError'`**

The request is canceled mid-download, or `AbortSignal.timeout()` runs out.

## Description

Besides the downloaded copy, it creates a string and the parsed objects. When the content is very large, read it chunk by chunk with [`body`](body.md).

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  const data = await res.json();
  console.log(data.url);
}
main();
```

**Result**: It prints `https://httpbin.org/get`. `data` is the parsed plain object.

## Differences from the web

Content is always decoded as UTF-8. Invalid UTF-8 decodes to an empty string, so it rejects with `SyntaxError`.

## See also

- [`text()`](text.md)
- [Choosing among the four ways to read](../response.md#choosing-among-the-four-ways-to-read)
