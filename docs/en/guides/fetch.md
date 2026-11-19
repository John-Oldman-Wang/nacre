# Fetching data from the network

This guide covers making HTTP requests with [`fetch()`](../api/fetch.md): getting JSON, sending data, uploading and downloading files, handling failures, canceling, and timeouts. The classes involved are [`Response`](../api/response.md), [`Request`](../api/request.md), [`Blob`](../api/blob.md), [`AbortController`](../api/abort-controller.md), and [`AbortSignal`](../api/abort-signal.md). For large files, download progress, and content the server keeps pushing, see [Reading a response as it downloads](streaming-response.md).

The examples below are all written inside `async` functions: `await` can only be used inside `async` functions, not directly at the top level of a file.

## Recommended approach

**Put both kinds of failure and the timeout in one function, and route every request through it.** When the network is unreachable, `fetch()` throws; when the server returns 404 or 500, `fetch()` does not throw, and only [`res.ok`](../api/response/ok.md) is `false`. Both must be handled; handle them in one place, and each call site only needs to handle one kind of exception.

```js
/**
 * @param {string} url
 * @param {RequestInit} [init]
 */
async function request(url, init) {
  let res;
  let data;
  try {
    // Give up if not done within 15 seconds. If the caller passes its own signal, the caller's wins
    res = await fetch(url, { signal: AbortSignal.timeout(15000), ...init });
    if (res.ok) data = await res.json();
  } catch (err) {
    if (err instanceof SyntaxError) throw new Error('The server did not return JSON');
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('The request timed out or was canceled');
    }
    throw new Error('The network is unreachable');
  }
  if (!res.ok) {
    throw new Error('The server returned ' + res.status);
  }
  return data;
}

request('https://httpbin.org/get')
  .then((data) => console.log(data.url))
  .catch((err) => console.log(err.message));
```

**Result**

- When the request succeeds, prints `https://httpbin.org/get`.
- When there is no network or the server cannot be reached, prints `The network is unreachable`.
- When the server returns 404, prints `The server returned 404`.
- When the download is not finished within 15 seconds, prints `The request timed out or was canceled`.
- When the content is not valid JSON, prints `The server did not return JSON`.

Four more points:

- **Read files and images with [`blob()`](../api/response/blob.md).** The content does not enter JS memory; once you have it, hand it straight to [`UIImage.imageWithData()`](../api/ui-image.md) or to `writeBytes()` of [`application.fileSystem`](../api/filesystem.md). Use `arrayBuffer()` only when you need to process the bytes yourself.
- **Cancel requests you no longer need.** When the user leaves a page or starts a new search, cancel the old request with `AbortController`. Otherwise it keeps downloading, and what it downloads stays in memory.
- **Read large files and responses that never end with [`res.body`](../api/response/body.md).** With the four whole-body methods, a file of tens of MB stays entirely in memory; a response the server keeps pushing never finishes downloading, so the four methods' `Promise` never settles. See [Reading a response as it downloads](streaming-response.md).
- **Check `res.ok` before reading the content.** When the server returns an error, the content is usually an error description, not the data you expect.

## The first request

The following code requests an address that returns JSON and prints the result to the console. The whole thing can go at the top level of `main.js`; there is no need to wait for `sceneconnect`.

```js
async function load() {
  // 1. Send the request. This line returns once the response headers and the first chunk of content arrive
  const res = await fetch('https://httpbin.org/get');

  // 2. Check whether the server returned a success status
  if (!res.ok) {
    console.log('The server returned an error:', res.status);
    return;
  }

  // 3. Read the response content and parse it as JSON
  const data = await res.json();
  console.log(res.status, data.url);
}

// 4. fetch fails when the network is unreachable; catch it
load().catch((err) => {
  console.log('The request was not sent or no response was received:', err.message);
});
```

**Result**

- When the network works, the console prints `200 https://httpbin.org/get`.
- When the server returns 404 or 500, prints `The server returned an error: 404`.
- When there is no network or the server cannot be reached, prints `The request was not sent or no response was received:` followed by an error description.

The four steps are: send the request, check the status, read the content, handle failure. Steps 2 and 4 handle two different kinds of failure; see [When a request counts as failed](../api/fetch/fetch.md#when-a-request-counts-as-failed).

## Write the full address

The address must be a full URL with a scheme and host name, such as `https://api.example.com/items`. A relative address like `fetch('/api/items')` has no base address to resolve against, and the `Promise` is rejected with `TypeError`.

`fetch()` can request any server. Requests are not subject to cross-origin rules; the server does not need to return CORS response headers, and no preflight request is sent.

Use `https://` addresses. iOS blocks requests to plain `http://` addresses by default, and projects generated by the CLI do not lift this restriction. The result of `fetch()` requesting an `http://` address is **not verified in the simulator**; under the same restriction, [`WebView`](../api/web-view.md) loading an `http://` address was blocked when tested.

## Requesting a test server on this machine

During development, to request an `http://` service on this machine or the local network (such as a test server running on your computer), allow local networking in `nacre.config.json`:

```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": { "NSAllowsLocalNetworking": true }
    }
  }
}
```

**Result**: `http://` requests to `127.0.0.1` are no longer blocked (verified by testing in the simulator). According to iOS documentation, this setting also allows local network addresses and `.local` host names, while other addresses still require `https://`; these two points are **not verified in the simulator**. For how to write the configuration file, see [Configuring the app: name, languages, usage descriptions](project-config.md).

## Getting JSON

```js
async function getJson() {
  const res = await fetch('https://httpbin.org/get');
  const data = await res.json();
  console.log(data.url);
}
```

**Result**: Prints `https://httpbin.org/get`. `data` is the parsed plain object.

When the content is not valid JSON, the `Promise` returned by `res.json()` is rejected with `SyntaxError`.

## Checking whether a request succeeded

```js
async function checkStatus() {
  const res = await fetch('https://httpbin.org/status/404');
  console.log(res.ok);       // false
  console.log(res.status);   // 404
}
```

**Result**: This code does not throw. When the server returns 404 or 500, `fetch()` still succeeds; only `res.ok` is `false`. `res.ok` is `true` when the status code is 200 to 299.

## Sending JSON

```js
async function postJson() {
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'nacre', count: 3 }),
  });
  const echo = await res.json();
  console.log(echo.json.name);
}
```

**Result**: Prints `nacre`. This test address echoes back what it receives.

- A plain object cannot be used directly as `body`: it is converted to the string `[object Object]` and sent, with no error. Convert it to a string with `JSON.stringify()` first. Chinese and other non-ASCII text in the string is sent as UTF-8.
- You must write `Content-Type` yourself. Without it, a string `body` is sent as `text/plain;charset=UTF-8`, and the server will not parse it as JSON.

For which values `body` accepts, see [the parameters of `fetch()`](../api/fetch/fetch.md#parameters).

## Uploading binary data

`body` can be a typed array, an `ArrayBuffer`, or a [`Blob`](../api/blob.md); the bytes are sent as is.

```js
async function postBytes() {
  const bytes = new Uint8Array([0, 255, 16, 128]);
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: bytes,
  });
  const echo = await res.json();
  console.log(echo.data);
}
```

**Result**: Prints `data:application/octet-stream;base64,AP8QgA==`. The four bytes reached the server unchanged. This test address echoes binary content as base64.

> **Note:** When `body` is a typed array or an `ArrayBuffer`, write `Content-Type` yourself. Without it, the system fills in `application/x-www-form-urlencoded`, and the server parses the bytes as a form (verified by testing).

When `body` is a `Blob`, the `Blob`'s `type` becomes `Content-Type`, so you do not need to write it separately:

```js
async function postBlob() {
  const bytes = new Uint8Array([0, 255, 16, 128]);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const res = await fetch('https://httpbin.org/post', { method: 'POST', body: blob });
  const echo = await res.json();
  console.log(echo.headers['Content-Type']);
}
```

**Result**: Prints `application/octet-stream`.

## Uploading a file

First read the file into an `ArrayBuffer` with `readBytes()` of [`application.fileSystem`](../api/filesystem.md), then send it as `body`.

```js
async function uploadFile() {
  const path = application.fileSystem.documents + '/photo.jpg';
  const bytes = await application.fileSystem.readBytes(path);
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: bytes,
  });
  console.log(res.status);
}
```

**Result**: The file's bytes are sent as the request body, and it prints `200`. **This example is not verified in the simulator.**

The whole file is read into memory first. There is no progress during the upload.

## Adding custom request headers

```js
async function withHeaders() {
  const res = await fetch('https://httpbin.org/get', {
    headers: {
      'Authorization': 'Bearer abc123',
      'Accept': 'application/json',
    },
  });
  console.log(res.status);
}
```

**Result**: The request is sent with these two headers, and it prints `200`.

`headers` can be a plain object or a [`Headers`](../api/headers.md) object. When a header name contains invalid characters or a value contains a line break, the `Promise` of `fetch()` is rejected. Headers such as `Host`, `Cookie`, and `Origin` can all be set yourself.

## Reading response headers

```js
async function readHeaders() {
  const res = await fetch('https://httpbin.org/get');
  console.log(res.headers.get('content-type'));
  console.log(res.headers.get('CONTENT-TYPE'));
}
```

**Result**: Both lines print `application/json`. Response header names are case-insensitive.

When the server returns several headers with the same name, `get()` returns one string joined with `, `.

## Getting text

```js
async function getText() {
  const res = await fetch('https://httpbin.org/range/16');
  const text = await res.text();
  console.log(text);
}
```

**Result**: Prints `abcdefghijklmnop`.

`text()` always decodes as UTF-8, ignoring the encoding declared in the response headers. When the content is not valid UTF-8, it gives an empty string `''`, with no error. For text in other encodings, read the bytes with `arrayBuffer()` and decode them yourself.

## Downloading and displaying an image

```js
async function getImage() {
  const res = await fetch('https://httpbin.org/image/png');
  const blob = await res.blob();
  const image = UIImage.imageWithData(blob);
  console.log(blob.size, image !== null);
}
```

**Result**: Prints the image's byte count and `true`. `image` can be assigned to the `image` property of a `UIImageView`; see [`UIImage`](../api/ui-image.md). When the content is not an image, `image` is `null`.

## Saving downloaded content to a file

```js
async function saveFile() {
  const res = await fetch('https://httpbin.org/bytes/1024');
  const blob = await res.blob();
  const path = application.fileSystem.documents + '/data.bin';
  await application.fileSystem.writeBytes(path, blob);
  console.log(blob.size);
}
```

**Result**: Prints `1024`. The documents directory gains a 1024-byte file, `data.bin`. **This example is not verified in the simulator.**

From download to writing the file, the content never enters JS memory. During the download the whole file is still in the app's memory: with the four whole-body methods, the downloaded content stays in memory until the `Response` is no longer referenced by any variable and is collected.

## Getting binary data to process yourself

```js
async function getBytes() {
  const res = await fetch('https://httpbin.org/range/256');
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  console.log(buffer.byteLength, bytes[0]);
}
```

**Result**: Prints `256 97`. `97` is the code for the letter `a`.

For the differences between the four ways of reading, see [Choosing among the four ways of reading](../api/response.md#choosing-among-the-four-ways-to-read). The response content can only be read once; if you need it twice, store the result of the first read in a variable; see [The response content can only be read once](../api/response.md#the-body-can-be-read-only-once).

## Canceling a request

```js
async function cancelRequest() {
  const controller = new AbortController();
  const promise = fetch('https://httpbin.org/delay/5', { signal: controller.signal });

  setTimeout(() => controller.abort(), 200);

  try {
    await promise;
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
```

**Result**: After 200 milliseconds, prints `AbortError`. The request is actually canceled and no longer uses the network.

- One `controller.signal` can be given to several requests, and one `abort()` cancels them all. Requests that have already completed are not affected.
- `signal` can also be given when constructing a [`Request`](../api/request.md); passing that `Request` to `fetch()` later has the same canceling effect.
- If you no longer want the content after getting the `Response` but before reading it, you can also cancel with it, and the download stops immediately.

## Setting a timeout for a request

The runtime sets no separate timeout for requests; it uses the system default (iOS documentation says 60 seconds without receiving data, **not verified in the simulator**). For a shorter timeout, use [`AbortSignal.timeout()`](../api/abort-signal/timeout.md):

```js
async function withTimeout() {
  try {
    await fetch('https://httpbin.org/delay/5', { signal: AbortSignal.timeout(300) });
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
```

**Result**: After 300 milliseconds the request is canceled, and it prints `AbortError`.

- The argument is in milliseconds. Timing starts when `AbortSignal.timeout()` is called, not when the request is sent.
- The time includes downloading the content: if the time runs out after `fetch()` has returned but before the content is fully read, the step that reads the content is rejected.
- A timeout and a manual cancellation give the same exception, `AbortError`; you cannot tell which one it was from the exception.

## Sending several requests at once

```js
async function many() {
  const urls = [
    'https://httpbin.org/get?id=1',
    'https://httpbin.org/get?id=2',
    'https://httpbin.org/get?id=3',
  ];
  const responses = await Promise.all(urls.map((url) => fetch(url)));
  const results = await Promise.all(responses.map((res) => res.json()));
  console.log(results.length);
}
```

**Result**: The three requests are sent at the same time, and after all of them complete it prints `3`.

- The runtime does not limit how many requests run at once, and requests do not wait for each other. Measured: sending 10 requests at once took less than 4 times as long as a single request.
- If one of the requests fails at the network level, `Promise.all` is rejected as a whole, and the results of the other requests are lost. To get each request's result separately, use `Promise.allSettled`.

## Creating a piece of data yourself

```js
async function makeBlob() {
  const blob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
  console.log(blob.size, blob.type);
  console.log(await blob.text());
}
```

**Result**: Prints `13 text/plain` and `前缀-后缀`. `size` is the number of bytes after UTF-8 encoding; each Chinese character takes 3 bytes.

## Replacing real requests in tests

[`new Response()`](../api/response/constructor.md) creates a response without sending a request. Write the function under test to take a `Response`, and pass one you created in tests:

```js
async function fakeResponse() {
  const res = new Response('{"ok":true}', {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  console.log(res.status, data.ok);
}
```

**Result**: Prints `201 true`.

## After the app goes into the background

iOS suspends an app soon after it goes into the background. Whether requests not yet completed at that point continue, pause, or fail is **not verified in the simulator**. For requests that must complete, check the result after returning to the foreground and resend if it failed.

## Requests carry cookies automatically

Cookies the server sets with `Set-Cookie` are saved by the system, and later requests to the same site carry them automatically. **Not verified in the simulator.** These cookies and the cookies of web pages in a [`WebView`](../api/web-view.md) are two separate sets (verified by testing): a user signing in on a web page does not make `fetch()` carry the signed-in state, and vice versa.

## See also

- [`fetch()`](../api/fetch.md): the function and this group of classes
- [`Response`](../api/response.md), [`Request`](../api/request.md), [`Blob`](../api/blob.md)
- [`AbortController`](../api/abort-controller.md), [`AbortSignal`](../api/abort-signal.md): canceling and timeouts
- [`Headers`](../api/headers.md), [`URL`](../api/url.md): request headers and addresses
- [Reading a response as it downloads](streaming-response.md): large files, download progress, server push
