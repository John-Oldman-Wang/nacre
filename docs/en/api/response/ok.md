---
type: reference
web: Response.ok
---

# `Response`: `ok` property

The **`ok`** property indicates whether the server returned a success status code.

## Value

A boolean.

- `true`: [`status`](status.md) is between 200 and 299.
- `false`: any other status code, such as 404 or 500.
- Read-only; assigning to it throws `TypeError`.
- It doesn't change after the `Response` is created.

When the server returns 404 or 500, [`fetch()`](../fetch/fetch.md) doesn't throw; the `Promise` fulfills as usual, only `ok` is `false`. So check it before reading the body: when the server returns an error, the body is usually an error description, not the data you expect.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/status/404');
  console.log(res.ok);
  console.log(res.status);
}
main();
```

**Result**: It prints `false` and `404`. This code doesn't throw.

## Differences from the web

Same as on the web.

## See also

- [`status`](status.md): the specific status code
- [When a request counts as failed](../fetch/fetch.md#when-a-request-counts-as-failed)
