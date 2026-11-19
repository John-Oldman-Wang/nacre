---
type: reference
web: Response.bodyUsed
---

# `Response`: `bodyUsed` property

The **`bodyUsed`** property indicates whether the response body has already been read.

## Value

A boolean.

- `true`: the body has been read or canceled. After that, all four reading methods reject: `TypeError: Body has already been read`.
- `false`: not read yet. Only getting a reader on [`body`](body.md) without reading doesn't count as read.
- Read-only; assigning to it throws `TypeError`.
- It becomes `true` when the content is read and never goes back to `false`. It has no change event: reading is started by your own code.
- For a response without a body ([`body`](body.md) is `null`), it stays `false` after reading, and you can read repeatedly.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  await res.json();
  console.log(res.bodyUsed);
  try {
    await res.json();
  } catch (err) {
    console.log(err instanceof Error ? err.message : err);
  }
}
main();
```

**Result**: It prints `true` and `Body has already been read`.

## Differences from the web

Same as on the web.

## See also

- [The body can be read only once](../response.md#the-body-can-be-read-only-once)
