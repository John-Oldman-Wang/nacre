---
type: reference
web: Response.status
---

# `Response`: `status` property

The **`status`** property is the response's HTTP status code, such as `200` or `404`.

## Value

A number.

- Read-only; assigning to it throws `TypeError`.
- On responses from `fetch()`, it is the status code the server returned. When the server returns 301 or 302, the system follows the redirect automatically, and this is the status code of the final response.
- For a response you create with [`new Response()`](constructor.md), it is `init.status`, defaulting to `200`.
- It doesn't change after the `Response` is created.

## Examples

```js
const res = new Response('created', { status: 201 });
console.log(res.status, res.ok);
```

**Result**: It prints `201 true`.

## Differences from the web

Same as on the web.

## See also

- [`ok`](ok.md): whether the status code is between 200 and 299
- [`statusText`](statustext.md)
