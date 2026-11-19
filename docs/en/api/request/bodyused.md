---
type: reference
web: Request.bodyUsed
---

# `Request`: `bodyUsed` property

The **`bodyUsed`** property indicates whether the body has already been read with one of the four reading methods.

## Value

A boolean.

- `true`: the body has been read. Afterward all four reading methods reject with `TypeError: Body has already been read`, and [`clone()`](clone.md) also throws `TypeError`.
- `false`: not read yet.
- Read-only; assigning to it throws `TypeError`.
- It becomes `true` when the body is read and never goes back to `false`. There's no change event: reading is started by your own code.
- A `Request` with no body (a `GET` request, for example) stays `false` after reading.
- Passing a `Request` to `fetch()` doesn't make it `true`.

## Examples

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  console.log(await req.text());
  console.log(req.bodyUsed);
}
main();
```

**Result**: Prints `hello` and `true`.

## Differences from the web

After a `Request` is passed to `fetch()`, its `bodyUsed` becomes `true` on the web; in Nacre it doesn't change.

## See also

- [`bodyUsed` of `Response`](../response/bodyused.md)
