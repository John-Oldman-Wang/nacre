---
type: reference
web: Request.blob()
---

# `Request`: `blob()` method

The **`blob()`** method reads the body given at construction and returns it as a [`Blob`](../blob.md).

## Syntax

```
blob()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with a [`Blob`](../blob.md). When there's no body, it's a `Blob` whose `size` is 0.

### Exceptions

The returned `Promise` rejects when the body has already been read:

**`TypeError`**

`Body has already been read`.

## Examples

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  const blob = await req.blob();
  console.log(blob.size);
}
main();
```

**Result**: Prints `5`. **Not verified in the simulator.**

## Differences from the web

On the web, the resulting `Blob`'s `type` comes from the request's `Content-Type`. In Nacre: when the body is a `Blob`, you get that same `Blob`, with its own `type`; for any other body, the resulting `Blob`'s `type` is an empty string. **From the code; not verified in the simulator.**

## See also

- [`Blob`](../blob.md)
- [`blob()` of `Response`](../response/blob.md)
