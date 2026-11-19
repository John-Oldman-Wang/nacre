---
type: reference
web: Request()
---

# `Request()` constructor

The **`Request()`** constructor creates a request from a URL and options. It doesn't send the request; passing it to [`fetch()`](../fetch/fetch.md) does.

## Syntax

```
new Request(input)
new Request(input, init)
```

### Parameters

**`input`**

The request URL: a string, a [`URL`](../url.md), or another `Request`. The URL must be a full URL.

When it's another `Request`, the new object takes over its URL, method, headers, body, and `signal`. Fields given in `init` take precedence.

**`init`**

Request options, an object, optional. Omitting it or giving `null` is treated as an empty object. The fields are the same as [`init` of `fetch()`](../fetch/fetch.md#parameters):

**`init.method`**

The request method, a string. Defaults to `'GET'` (or the method of `input` when it's a `Request`). Converted to uppercase.

**`init.headers`**

Request headers, a plain object or a [`Headers`](../headers.md).

**`init.body`**

The request body. For allowed values and the default `Content-Type` that gets added, see [`init.body` of `fetch()`](../fetch/fetch.md#parameters). Defaults to `null`.

**`init.signal`**

An [`AbortSignal`](../abort-signal.md) or `null`. When `input` is a `Request`: omit it to take over that request's signal; write `null` so the new object doesn't carry the original `signal`.

### Return value

A new `Request`.

### Exceptions

**`TypeError`**

- The URL isn't a full URL: the message starts with `Invalid URL:`.
- `init.signal` is neither an `AbortSignal` nor `null`: `Request: signal must be an AbortSignal or null`.
- `input` is a `Request` whose body has already been read, and `init` gives no new `body`: `Cannot construct a Request from a Request whose body has already been read`.
- Invalid headers: an invalid name gives a message starting with `Invalid header name:`; a line break in a value gives `Header value cannot contain NUL, CR or LF`.

## Description

- Passing a `Request` to `fetch()` doesn't make its [`bodyUsed`](bodyused.md) `true`.
- Passing the same `Request` with a body to `fetch()` more than once is **not verified in the simulator**.

## Examples

```js
const base = new Request('https://httpbin.org/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{"a":1}',
});
const put = new Request(base, { method: 'PUT' });
console.log(put.method, put.url);
```

**Result**: Prints `PUT https://httpbin.org/post`. `put` takes over the headers and body of `base`.

## Differences from the web

- `init` has no `mode`, `credentials`, `cache`, or `redirect`; writing them has no effect.
- All method names are converted to uppercase. The web converts only standard method names. **From the code; not verified in the simulator.**

## See also

- [`clone()`](clone.md): copies a request
- [`fetch()`](../fetch/fetch.md)
