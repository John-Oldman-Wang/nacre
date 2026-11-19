---
type: reference
web: Request.url
---

# `Request`: `url` property

The **`url`** property is the request URL, a full URL after normalization.

## Value

A string.

- Readable, not writable.
- The URL given at construction is normalized by [`URL`](../url.md): for example, the host name is converted to lowercase, and a URL with only a host name gets a `/` added.

## Examples

```js
const req = new Request('https://HTTPBIN.org');
console.log(req.url);
```

**Result**: Prints `https://httpbin.org/`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`URL`](../url.md): how URLs are normalized
