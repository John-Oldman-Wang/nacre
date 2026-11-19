---
type: reference
web: Request.json()
---

# `Request`: `json()` method

The **`json()`** method reads the body given at construction, decodes it as UTF-8, and parses it as JSON.

## Syntax

```
json()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with the parsed value.

### Exceptions

The returned `Promise` rejects when the body has already been read:

**`TypeError`**

`Body has already been read`.

**`SyntaxError`**

The body isn't valid JSON. With no body you get an empty string, which isn't valid JSON either, so this exception is raised too.

## Examples

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: '{"a":1}' });
  const data = await req.json();
  console.log(data.a);
}
main();
```

**Result**: Prints `1`.

## Differences from the web

Same as on the web.

## See also

- [`json()` of `Response`](../response/json.md)
