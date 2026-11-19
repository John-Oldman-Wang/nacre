---
type: reference
web: Request.clone()
---

# `Request`: `clone()` method

The **`clone()`** method returns an independent copy of this request.

## Syntax

```
clone()
```

### Parameters

None.

### Return value

A new `Request` with the same URL, method, headers, and body as the original. The copy's body can also be read and sent. `signal` is the same object as the original's.

### Exceptions

**`TypeError`**

The body has already been read: `Cannot clone a Request whose body has already been read`.

## Examples

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  const copy = req.clone();
  console.log(await req.text(), await copy.text());
}
main();
```

**Result**: Prints `hello hello`.

## Differences from the web

Same as on the web.

## See also

- [`Request()`](constructor.md)
