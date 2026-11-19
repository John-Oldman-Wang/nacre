---
type: reference
web: Response.type
---

# `Response`: `type` property

The **`type`** property is always `'basic'` in Nacre.

## Value

A string, always `'basic'`.

- Read-only; assigning to it throws `TypeError`.
- `fetch()` can request any URL and has no cross-origin rules, so there are no values such as `'cors'` or `'opaque'`.

## Examples

```js
const res = new Response('x');
console.log(res.type);
```

**Result**: It prints `basic`.

## Differences from the web

The web gives `'basic'`, `'cors'`, `'opaque'`, and other values depending on whether the request was cross-origin. In Nacre it is always `'basic'`.

## See also

- [`fetch()`](../fetch/fetch.md)
