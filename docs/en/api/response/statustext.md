---
type: reference
web: Response.statusText
---

# `Response`: `statusText` property

The **`statusText`** property is the text for the status code.

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- Always the empty string `''` on responses from `fetch()`.
- For a response you create with [`new Response()`](constructor.md), it is `init.statusText`, defaulting to `''`.
- It doesn't change after the `Response` is created.

## Examples

```js
const res = new Response(null, { status: 404, statusText: 'Not Found' });
console.log(res.statusText);
```

**Result**: It prints `Not Found`.

## Differences from the web

Always the empty string on responses from `fetch()`. On the web it is the text the server returned.

## See also

- [`status`](status.md)
