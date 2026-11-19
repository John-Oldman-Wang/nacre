---
type: reference
web: Request.text()
---

# `Request`: `text()` method

The **`text()`** method reads the body given at construction and decodes it as UTF-8 into a string.

## Syntax

```
text()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with a string. When there's no body, it's the empty string `''`.

### Exceptions

The returned `Promise` rejects when the body has already been read:

**`TypeError`**

`Body has already been read`.

## Examples

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  console.log(await req.text());
}
main();
```

**Result**: Prints `hello`.

## Differences from the web

Same as on the web.

## See also

- [`text()` of `Response`](../response/text.md)
