---
type: reference
web: Request
---

# `Request`

**`Request`** represents an HTTP request: the URL, method, headers, body, and the signal used to cancel it, kept in one object. Passing it to [`fetch()`](fetch.md) sends the request.

You can send a request by passing a URL and options directly to `fetch()`. Use `Request` when you need to prepare a request first, then send it later or pass it to another function.

`Request` also has [`bodyUsed`](request/bodyused.md) and four reading methods, which read the body given at construction. It has no `body` property.

**Inheritance**: `Request` doesn't inherit from other classes.

For how to send requests, see the guide [Fetching data from the network](../guides/fetch.md).

## Constructor

[`Request()`](request/constructor.md)

Creates a request from a URL and options. The parameters are the same as `fetch()`.

## Instance properties

All of these properties are readable and not writable.

| Property | Description |
| --- | --- |
| [`url`](request/url.md) <small>read-only</small> | The request URL, a full URL after normalization |
| [`method`](request/method.md) <small>read-only</small> | The request method, uppercase |
| [`headers`](request/headers.md) <small>read-only</small> | The request headers |
| [`signal`](request/signal.md) <small>read-only</small> | The `AbortSignal` used to cancel this request |
| [`bodyUsed`](request/bodyused.md) <small>read-only</small> | Whether the body has already been read |

## Instance methods

| Method | Description |
| --- | --- |
| [`clone()`](request/clone.md) | Returns an independent copy |

The four methods that read the body follow the same rules as on [`Response`](response.md): they all return a `Promise`, and once any one has been read, none of the others can be read.

| Method | Description |
| --- | --- |
| [`json()`](request/json.md) | Parses the body as JSON |
| [`text()`](request/text.md) | Decodes the body as UTF-8 |
| [`arrayBuffer()`](request/arraybuffer.md) | Gets the body as an `ArrayBuffer` |
| [`blob()`](request/blob.md) | Gets the body as a [`Blob`](blob.md) |

## Examples

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  const res = await fetch(req);
  const echo = await res.json();
  console.log(echo.data);
}
main();
```

**Result**: Prints `hello`. The request is sent with the method and body from the `Request`.

## Differences from the web

- There's no `body` property. The body can only be read with the four reading methods.
- There are no properties such as `mode`, `credentials`, `cache`, or `redirect`.
- `signal` is the very object given at construction. On the web it's a separately created signal that follows it.
- All method names are converted to uppercase. The web converts only standard method names such as `GET` and `POST` to uppercase, and keeps `'patch'` as is. **From the code; not verified in the simulator.**

## See also

- [`fetch()`](fetch.md): sends the request
- [`Response`](response.md): the response to the request
- [`AbortController`](abort-controller.md): canceling a request
