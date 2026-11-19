---
type: reference
web: Response()
---

# `Response()` constructor

The **`Response()`** constructor creates a response with the given body, status code, and headers. It doesn't send a request; it is commonly used to stand in for a real request in tests.

## Syntax

```
new Response()
new Response(body)
new Response(body, init)
```

### Parameters

**`body`**

The response body, optional. The accepted values are the same as [`init.body` of `fetch()`](../fetch/fetch.md#parameters): a string, [`Blob`](../blob.md), `ArrayBuffer`, typed array, or [`URLSearchParams`](../url-search-params.md); other values are converted to strings with `String()`. When omitted or `null`, the response has no body, and [`body`](body.md) is `null`.

**`init`**

An object, optional. Omitted or `null` is treated as an empty object.

**`init.status`**

The status code, a number. Defaults to `200`.

**`init.statusText`**

The text for the status code, a string. Defaults to `''`.

**`init.headers`**

The response headers, a plain object or [`Headers`](../headers.md). No headers by default. When `Content-Type` isn't given, a default is added based on the kind of `body`, by the same rules as `init.body` of `fetch()`: a string gets `text/plain;charset=UTF-8`, `URLSearchParams` gets `application/x-www-form-urlencoded;charset=UTF-8`, and a `Blob` with a `type` gets its `type`.

### Return value

A new `Response`. Its [`url`](url.md) is the empty string.

### Exceptions

**`TypeError`**

When `init.headers` is invalid, the message comes from [`Headers`](../headers.md): an invalid name starts with `Invalid header name:`; a value containing a line break is `Header value cannot contain NUL, CR or LF`.

## Examples

```js
async function main() {
  const res = new Response('{"ok":true}', {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(res.status);
  const data = await res.json();
  console.log(data.ok);
}
main();
```

**Result**: It prints `201` and `true`.

## Differences from the web

- `init.status` isn't range-checked. The web throws `RangeError` when the status isn't between 200 and 599. **Taken from the code; not verified in the simulator.**
- Otherwise the same as on the web.

## See also

- [`fetch()`](../fetch.md): actually sending a request to get a `Response`
