---
type: reference
web: fetch()
---

# `fetch()`

The **`fetch()`** function sends an HTTP request and returns a `Promise`. The `Promise` fulfills with a [`Response`](response.md) when the server's status code, response headers, and first chunk of the response body arrive.

The request runs in the background. While waiting, JS keeps running and the interface stays responsive. Requests don't depend on the interface: they can be sent from anywhere after the app launches, including the top level of a file, without waiting for `sceneconnect`. `fetch()` can request any server and isn't subject to cross-origin rules.

Classes used together with `fetch()`:

- [`Response`](response.md): the response to a request; read its status code, headers, and body.
- [`Request`](request.md): keeps a request's URL and options in one object.
- [`Blob`](blob.md): an immutable block of binary data, for uploading and for storing downloaded content.
- [`ReadableStream`](readable-stream.md) and [`ReadableStreamDefaultReader`](readable-stream-default-reader.md): read a response body chunk by chunk while it is still downloading.
- [`AbortController`](abort-controller.md) and [`AbortSignal`](abort-signal.md): cancel requests and set timeouts.
- [`Headers`](headers.md) and [`URL`](url.md): request headers and URLs.

For how to use these classes for common tasks, see the guides [Fetching data from the network](../guides/fetch.md) and [Reading a response as it downloads](../guides/streaming-response.md).

## Functions

[`fetch()`](fetch/fetch.md)

Sends a request and returns a `Promise` that fulfills with a `Response`.

## Examples

The code below requests a URL that returns JSON and prints the result to the console. The whole thing can go at the top level of `main.js`.

```js
async function load() {
  // 1. Send the request. This line returns when the headers and first chunk arrive
  const res = await fetch('https://httpbin.org/get');

  // 2. Check whether the server returned a success status
  if (!res.ok) {
    console.log('Server returned an error:', res.status);
    return;
  }

  // 3. Read the response body and parse it as JSON
  const data = await res.json();
  console.log(res.status, data.url);
}

// 4. fetch fails when the network is down; catch it
load().catch((err) => {
  console.log('The request was not sent or no response was received:', err.message);
});
```

**Result**

- When the network is working, the console prints `200 https://httpbin.org/get`.
- When the server returns 404 or 500, it prints `Server returned an error: 404`.
- When there is no network or the server can't be reached, it prints `The request was not sent or no response was received:` followed by an error description.

Steps 2 and 4 handle two different kinds of failure; see [When a request counts as failed](fetch/fetch.md#when-a-request-counts-as-failed).

> **Note:** `await` can only be written inside an `async` function. You can't write `await` directly at the top level of a file.

## Differences from the web

The names in the `fetch` group of APIs are the same as on the web. The differences are listed one by one under "Differences from the web" on each member page; this table collects them for people familiar with the web.

| Web | Nacre |
| --- | --- |
| `await fetch(url, init)` | Same. `url` must be a full URL |
| `fetch()` fulfills when the response headers arrive | Fulfills when the first chunk of the body arrives |
| `init.body` can be a string, `Blob`, `ArrayBuffer`, typed array, or `URLSearchParams` | Same |
| `init.body` can be `FormData` or `ReadableStream` | Not available |
| When `body` is an `ArrayBuffer` without `Content-Type`, that header isn't sent | The system fills in `application/x-www-form-urlencoded` |
| `init.mode`, `init.credentials`, `init.cache`, `init.redirect` | Not available; writing them has no effect |
| CORS preflight, same-origin policy | None; any URL can be requested |
| Headers such as `Host` and `Cookie` can't be set | All can be set |
| Cancellation throws `signal.reason`, a `DOMException` by default | Throws a new [`DOMException`](dom-exception.md) whose `name` is `'AbortError'`, not `signal.reason` |
| After `AbortSignal.timeout()` runs out, `fetch()` throws `TimeoutError` | Throws `AbortError` |
| `res.statusText` | Always the empty string on responses from `fetch()` |
| `res.text()` decodes using the encoding the response declares, replacing invalid bytes with the replacement character | Always decodes as UTF-8; gives an empty string when invalid |
| The `type` of `res.blob()` comes from `Content-Type` | `type` is the empty string |
| `res.formData()`, `res.clone()` | Not available |
| `req.body` | Not available. A `Request`'s body can only be read with the four reading methods |
| `new Blob([blob])` | Throws `TypeError` |
| `read()` rejects with `signal.reason` when the request is canceled | Rejects with `AbortError` |
| `reader.closed` fulfills when the body reaches its end | For streams from `fetch()`, it fulfills only after `read()` reaches `done` |
| Buffering is limited even when not reading; the download stops to wait | Limited only after you start reading with `read()`; downloading continues until then |
| A truncated response without `Content-Length` reports an error | No error when the server closes the connection normally |
| `new ReadableStream(…)`, `pipeTo()`, `pipeThrough()`, `tee()`, `getReader({ mode: 'byob' })` | Not available |
| `WritableStream`, `TransformStream`, `EventSource` | Not available |

## See also

- [Fetching data from the network](../guides/fetch.md): patterns for sending requests, handling failures, uploading, and downloading
- [Reading a response as it downloads](../guides/streaming-response.md): large files, download progress, content the server keeps pushing
- [`URL`](url.md) and [`Headers`](headers.md): URLs and request headers
- [`UIImage`](ui-image.md): turning a downloaded `Blob` into an image
- [File system](filesystem.md): writing a downloaded `Blob` to a file, and reading a file to upload
- [`WebView`](web-view.md): use it when you need to display web pages. Its cookies aren't shared with `fetch()`
- [WebSocket](websocket.md): use it when the server needs to push data
- [Timers](timers.md): timing other than `AbortSignal.timeout()`
- [How the runtime works](how-it-works.md): why requests don't freeze the interface
