---
type: reference
web: Response.url
---

# `Response`: `url` property

The **`url`** property is the URL the response came from.

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- On responses from `fetch()`, it is the request URL. When a redirect happened, it is the final URL (**not verified in the simulator**).
- On responses you create with [`new Response()`](constructor.md), it is the empty string.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  console.log(res.url);
  console.log(new Response('x').url === '');
}
main();
```

**Result**: It prints `https://httpbin.org/get` and `true`.

## Differences from the web

Same as on the web.

## See also

- [`redirected`](redirected.md)
