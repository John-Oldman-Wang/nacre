---
type: reference
web: Blob.type
---

# `Blob`: `type` property

The **`type`** property is the content type of the `Blob`, such as `'image/png'`.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- For a `Blob` created with [`new Blob()`](constructor.md), it's `options.type`, defaulting to an empty string.
- For a `Blob` from [`res.blob()`](../response/blob.md), it's an empty string; the `Content-Type` response header isn't used.
- When a `Blob` is used as the request body of [`fetch()`](../fetch/fetch.md), if `type` isn't empty and no `Content-Type` is written, it becomes the request's `Content-Type`.

## Examples

```js
async function main() {
  const bytes = new Uint8Array([0, 255, 16, 128]);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const res = await fetch('https://httpbin.org/post', { method: 'POST', body: blob });
  const echo = await res.json();
  console.log(echo.headers['Content-Type']);
}
main();
```

**Result**: prints `application/octet-stream`.

## Differences from the web

For a `Blob` from `res.blob()` it's an empty string. On the web it comes from `Content-Type`.

## See also

- [`size`](size.md)
