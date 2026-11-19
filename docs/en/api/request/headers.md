---
type: reference
web: Request.headers
---

# `Request`: `headers` property

The **`headers`** property is the request headers, a [`Headers`](../headers.md) object.

## Value

A [`Headers`](../headers.md).

- Readable, not writable.
- When no `Content-Type` was given at construction but a body was, a default one is added based on the kind of body; for the rules, see [`init.body` of `fetch()`](../fetch/fetch.md#parameters).

## Examples

```js
const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
console.log(req.headers.get('content-type'));
```

**Result**: Prints `text/plain;charset=UTF-8`.

## Differences from the web

Same as on the web.

## See also

- [`Headers`](../headers.md)
