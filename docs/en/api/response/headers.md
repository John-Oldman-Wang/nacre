---
type: reference
web: Response.headers
---

# `Response`: `headers` property

The **`headers`** property is the response headers, a [`Headers`](../headers.md) object.

## Value

A [`Headers`](../headers.md).

- Read-only; assigning to it throws `TypeError`.
- Header names are case-insensitive: `get('content-type')` and `get('CONTENT-TYPE')` give the same value.
- When the server returns several headers with the same name, `get()` gives one string joined with `, `. Read multiple `Set-Cookie` headers separately with `getSetCookie()`.
- For a response you create with [`new Response()`](constructor.md), it is `init.headers`, with a default `Content-Type` added based on the body when none is given.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  console.log(res.headers.get('content-type'));
  console.log(res.headers.get('CONTENT-TYPE'));
}
main();
```

**Result**: Both lines print `application/json`.

## Differences from the web

Same as on the web.

## See also

- [`Headers`](../headers.md): methods for reading and iterating headers
