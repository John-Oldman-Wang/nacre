---
type: reference
web: Response.redirected
---

# `Response`: `redirected` property

The **`redirected`** property is always `false` in Nacre.

## Value

A boolean, always `false`.

- Read-only; assigning to it throws `TypeError`.
- When the server returns 301 or 302, the system requests the new URL automatically, and [`fetch()`](../fetch/fetch.md) gets the final response. How many redirects happened in between can't be known, so this property can't be used to tell.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/redirect/1');
  console.log(res.redirected);
}
main();
```

**Result**: It prints `false`.

## Differences from the web

On the web it is `true` when a redirect happened. In Nacre it is always `false`.

## See also

- [`url`](url.md): the final URL
