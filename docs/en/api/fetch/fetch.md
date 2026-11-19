---
type: reference
web: fetch()
---

# `fetch()` function

The **`fetch()`** function sends an HTTP request and returns a `Promise`. The `Promise` fulfills with a [`Response`](../response.md) when the status code, response headers, and first chunk of the response body arrive.

## Syntax

```
fetch(input)
fetch(input, init)
```

### Parameters

**`input`**

The URL to request: a string, a [`URL`](../url.md), or a [`Request`](../request.md). It must be a full URL with a scheme and host, such as `https://api.example.com/items`. A relative URL like `'/api/items'` has no base URL to resolve against, and the `Promise` rejects with `TypeError`.

When it is a `Request`, the request uses its URL, method, headers, body, and `signal`. Fields given in `init` take precedence.

**`init`**

Request options, an object, optional. Omitted or `null` is treated as an empty object.

**`init.method`**

The request method, a string: `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`, and so on. Defaults to `'GET'`. Lowercase is converted to uppercase.

**`init.headers`**

Request headers, a plain object or [`Headers`](../headers.md). No headers by default. Headers such as `Host`, `Cookie`, and `Origin` can all be set; no header is forbidden.

**`init.body`**

The request body. Defaults to `null`, meaning no body. It can be one of the values below; when no `Content-Type` header is given, a default is added based on the kind of `body`:

| `body` value | What is sent | Default `Content-Type` |
| --- | --- | --- |
| String | The text encoded as UTF-8 | `text/plain;charset=UTF-8` |
| [`Blob`](../blob.md) | The bytes in the `Blob` | The `Blob`'s `type`. Not added when `type` is the empty string |
| `ArrayBuffer`, typed array | Those bytes | Not added |
| [`URLSearchParams`](../url-search-params.md) | Its serialized string, like `a=1&b=2` | `application/x-www-form-urlencoded;charset=UTF-8` |
| Other values (numbers, booleans, plain objects) | The string from `String()`. A plain object becomes `[object Object]` | `text/plain;charset=UTF-8` |

- A `Content-Type` you write yourself isn't overridden by the default.
- In the "not added" cases in the table, the system fills in `application/x-www-form-urlencoded` itself (measured). So write `Content-Type` yourself when sending binary data.

**`init.signal`**

An [`AbortSignal`](../abort-signal.md) or `null`, used to cancel the request. Defaults to `null`: the request can't be canceled.

When `input` is a `Request`: if `init` has no `signal`, the one the `Request` carries is used; if it has one, only the one in `init` is followed, and the one the `Request` carries no longer affects this request; `null` means this request can't be canceled.

### Return value

A `Promise` that fulfills with a [`Response`](../response.md). For when it fulfills, see [When it returns](#when-it-returns).

### Exceptions

`fetch()` itself doesn't throw; on error, the returned `Promise` rejects.

**`TypeError`**

- Can't connect, no network, or the domain can't be resolved: `message` is `Network request failed: ` followed by the system's description. The description's language follows the system; it is only suitable for logging.
- The URL isn't a full URL: `message` starts with `Invalid URL:`.
- `init.signal` is neither an `AbortSignal` nor `null`: `Request: signal must be an AbortSignal or null`.
- A header name contains invalid characters: `message` starts with `Invalid header name:`.
- A header value contains a line break or null character: `Header value cannot contain NUL, CR or LF`.

**An `Error` whose `name` is `'AbortError'`**

The request is canceled while in progress, or `AbortSignal.timeout()` runs out: `message` is `The operation was aborted`. Timeouts and manual cancellation give the same exception; you can't tell which from the exception.

**`signal.reason`**

The `signal` given to `fetch()` (in `init`, or carried by the `Request`) was already aborted before the call: the `Promise` rejects with that `signal`'s `reason`.

## Description

### When a request counts as failed

A request can fail at two levels, with different behavior.

| | What happened | How `fetch()` behaves |
| --- | --- | --- |
| Network-level failure | No network, the domain can't be resolved, the server can't be reached, the request was canceled, the URL is invalid | The `Promise` rejects; the `await` throws |
| The server returned an error | The server received the request and returned a status code such as 404 or 500 | The `Promise` fulfills normally; [`res.ok`](../response/ok.md) is `false` |

When the server returns 404 or 500, `fetch()` doesn't throw. `try` / `catch` alone doesn't catch a 404, and checking `res.ok` alone doesn't catch a dropped network.

After the status code and headers arrive, the network can still drop. By then the `fetch()` `Promise` has already fulfilled, and the failure shows up when reading the body: the `Promise` returned by `res.json()`, `res.text()`, and the other methods rejects, with the same exceptions as above. When reading as it downloads with `res.body`, it is the `Promise` returned by [`read()`](../readable-stream-default-reader/read.md) that rejects.

### When it returns

`fetch()` returns when the status code, headers, and **first chunk of the response body** arrive, not when the headers arrive. The rest of the body may still be downloading then, and the methods that read the body don't complete until it has all downloaded.

For most requests this makes no difference: the server sends the body right after the headers. For APIs where the server sends the headers first and the body only after a while (such as APIs that keep the connection open and push only when there is a message), `fetch()` doesn't return until the first message arrives. For measured data and how to handle it on the server side, see [The response arrives in two steps](../../guides/streaming-response.md#the-response-arrives-in-two-steps).

A response without a body (the response to a `HEAD` request, status 204) returns when the response ends.

### Timeouts

The runtime sets no separate timeout for requests and uses the system default. iOS documentation gives the default as failing after 60 consecutive seconds without receiving data; this value is **not verified in the simulator**. For a shorter timeout, pass [`AbortSignal.timeout()`](../abort-signal/timeout.md) as `signal`.

### What requests carry automatically

- **Cookies**. `fetch()` cookies are managed by the system: cookies the server writes with `Set-Cookie` are saved, and later requests to the same site carry them automatically. **Not verified in the simulator.** These cookies and the cookies of web pages in a [`WebView`](../web-view.md) are two separate sets (measured): a user signing in on a web page doesn't make `fetch()` carry the signed-in state, and vice versa.
- **Redirects**. When the server returns 301 or 302, the system requests the new URL automatically, and `fetch()` gets the final response. Following can't be disabled; see [`redirected`](../response/redirected.md).
- **Caching**. Caching follows the system's default rules and can't be controlled per request. The exact behavior is **not verified in the simulator**.

### Plain-text `http://` URLs

By default iOS blocks requests to plain-text `http://` URLs, and projects generated by the CLI don't lift this restriction. The result of `fetch()` requesting an `http://` URL is **not verified in the simulator**; under the same restriction, a [`WebView`](../web-view.md) loading an `http://` URL was measured to be blocked. For the configuration to request a local `http://` service during development, see [Requesting a local test service](../../guides/fetch.md#requesting-a-test-server-on-this-machine).

### Concurrent requests

The runtime doesn't limit the number of concurrent requests, and requests don't wait for each other. Measured: sending 10 requests at once took less than 4 times as long as a single request. How many connections are opened to the same server at once is up to the system; that limit hasn't been measured.

### After the app goes into the background

iOS suspends an app soon after it goes to the background. Whether requests not yet completed then continue, pause, or fail is **not verified in the simulator**.

## Examples

### Sending a GET request

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  const data = await res.json();
  console.log(res.status, data.url);
}
main();
```

**Result**: It prints `200 https://httpbin.org/get`.

### Sending JSON

```js
async function main() {
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'nacre', count: 3 }),
  });
  const echo = await res.json();
  console.log(echo.json.name);
}
main();
```

**Result**: It prints `nacre`. This test URL echoes back what it receives.

## Differences from the web

- `input` must be a full URL. There is no base URL to resolve against.
- It fulfills when the first chunk of the body arrives, not when the headers arrive.
- `init.body` can't be `FormData` or `ReadableStream`.
- When `body` is an `ArrayBuffer` or typed array without `Content-Type`, the system fills in `application/x-www-form-urlencoded`. The web doesn't send this header.
- There is no `init.mode`, `init.credentials`, `init.cache`, or `init.redirect`; writing them has no effect.
- There is no CORS preflight or same-origin policy; any URL can be requested.
- All headers can be set, including `Host` and `Cookie`.
- Cancellation while in progress throws an `Error` whose `name` is `'AbortError'`, not `signal.reason`. There is no `DOMException` class.
- After `AbortSignal.timeout()` runs out, it throws `AbortError`, not `TimeoutError`.

## See also

- [`Response`](../response.md): the response `fetch()` gets
- [`Request`](../request.md): preparing a request before sending it
- [`AbortController`](../abort-controller.md): canceling requests
- [Fetching data from the network](../../guides/fetch.md): patterns for common requests
