---
type: reference
web: Response
---

# `Response`

**`Response`** represents the response to an HTTP request: the status code, the response headers, and the response body. You get it when the `Promise` returned by [`fetch()`](fetch.md) fulfills.

The status code and headers are complete when you get the `Response`. The body may still be downloading: read it whole with one of the four reading methods, or chunk by chunk with [`body`](response/body.md). The body can be read only once; see [The body can be read only once](#the-body-can-be-read-only-once).

You can also create a `Response` yourself, to stand in for a real request in tests.

**Inheritance**: `Response` doesn't inherit from other classes.

For how to send requests and read responses, see the guide [Fetching data from the network](../guides/fetch.md).

## Constructor

[`Response()`](response/constructor.md)

Creates a response with the given body, status code, and headers.

## Instance properties

All of these properties are readable and not writable.

| Property | Description |
| --- | --- |
| [`ok`](response/ok.md) <small>read-only</small> | `true` when the status code is between 200 and 299 |
| [`status`](response/status.md) <small>read-only</small> | The status code |
| [`statusText`](response/statustext.md) <small>read-only</small> | The text for the status code |
| [`headers`](response/headers.md) <small>read-only</small> | The response headers |
| [`url`](response/url.md) <small>read-only</small> | The URL the response came from |
| [`body`](response/body.md) <small>read-only</small> | A stream of the body, for reading while downloading |
| [`bodyUsed`](response/bodyused.md) <small>read-only</small> | Whether the body has already been read |
| [`redirected`](response/redirected.md) <small>read-only</small> | Always `false` |
| [`type`](response/type.md) <small>read-only</small> | Always `'basic'` |

## Instance methods

All four reading methods wait for the whole body to download and return a `Promise`. Once any one has been used, none of the others can read.

| Method | Description |
| --- | --- |
| [`json()`](response/json.md) | Parses as JSON and gives the parsed value |
| [`text()`](response/text.md) | Decodes as UTF-8 and gives a string |
| [`arrayBuffer()`](response/arraybuffer.md) | Gives an `ArrayBuffer` |
| [`blob()`](response/blob.md) | Gives a [`Blob`](blob.md); the content doesn't enter JS memory |

## Concepts

### Choosing among the four ways to read

| Method | What you get | When to use it | Memory |
| --- | --- | --- | --- |
| `json()` | The parsed value | JSON returned by an API | Besides the downloaded content, creates a string and the parsed objects |
| `text()` | A string | Text, HTML | Besides the downloaded content, creates a string |
| `arrayBuffer()` | An `ArrayBuffer` | Binary data you process byte by byte | Creates no string |
| `blob()` | A [`Blob`](blob.md) | Images, video, files you pass straight to another API | Creates no string; the content doesn't enter JS memory |

Downloading and text decoding happen in the background, and the interface stays responsive while waiting.

With the four methods that read the whole body, the downloaded content stays in memory until the `Response` object is no longer referenced by any variable and is reclaimed. If you don't need the body after getting the `Response`, cancel the request with [`AbortController`](abort-controller.md), and the download stops immediately.

When you don't want to wait for the download to finish, read chunk by chunk with [`body`](response/body.md); see [Reading a response as it downloads](../guides/streaming-response.md).

### The body can be read only once

The four reading methods share one chance: once any one has been used, the others can't read, and the returned `Promise` rejects: `TypeError: Body has already been read`. If you need the content twice, store the first result in a variable. `Response` has no `clone()`.

`body` and these four methods read the same content, so they exclude each other:

| What was done first | Afterward |
| --- | --- |
| One of the four reading methods was called | `res.body.locked` is `true`, and `res.body.getReader()` throws `TypeError` |
| `res.body` was read (`read()` was called), or canceled (`cancel()` was called) | `res.bodyUsed` is `true`, and the four reading methods reject: `TypeError: Body has already been read` |
| `res.body` has a reader that hasn't read yet | The four reading methods reject: `TypeError: Body is locked: response.body has a reader`. `res.bodyUsed` is still `false`; after calling the reader's `releaseLock()`, the four methods work as usual |
| Only the `res.body` property was accessed, without getting a reader | No effect |

### Responses without a body

The following `Response` objects have no body, and their `body` is `null`:

- Created yourself with the `body` argument `null` or omitted;
- `fetch()` sent a `HEAD` request;
- `fetch()` got status code 204, 205, or 304.

Reading a `Response` without a body gives:

| Method | Result |
| --- | --- |
| `text()` | The empty string `''` |
| `arrayBuffer()` | An `ArrayBuffer` of 0 bytes |
| `blob()` | A `Blob` whose `size` is 0 |
| `json()` | Rejects with `SyntaxError`. An empty string isn't valid JSON |

In this case `bodyUsed` stays `false`, and you can read repeatedly. The empty string `''` doesn't count as "no body": it is a body of length 0, `body` is a stream (the first `read()` is already `done`), and after one read `bodyUsed` is `true`.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  console.log(res.ok, res.status);
  console.log(res.headers.get('content-type'));
  const data = await res.json();
  console.log(data.url);
}
main();
```

**Result**: It prints `true 200`, `application/json`, then `https://httpbin.org/get`.

## Differences from the web

- On responses from `fetch()`, `statusText` is always the empty string.
- `text()` always decodes as UTF-8, and gives an empty string when the bytes are invalid. The web decodes using the encoding the response declares, and replaces invalid bytes with the replacement character.
- The `type` of the `Blob` from `blob()` is the empty string. On the web it comes from `Content-Type`.
- `redirected` is always `false`, and `type` is always `'basic'`.
- There is no `clone()` or `formData()`, and no static methods `Response.json()`, `Response.error()`, or `Response.redirect()`.

## See also

- [`fetch()`](fetch.md): gets a `Response`
- [`ReadableStream`](readable-stream.md): the type of `body`
- [Fetching data from the network](../guides/fetch.md)
- [Reading a response as it downloads](../guides/streaming-response.md)
