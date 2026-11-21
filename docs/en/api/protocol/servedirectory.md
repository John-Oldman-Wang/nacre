---
type: reference
native: "-[WKWebViewConfiguration setURLSchemeHandler:forURLScheme:]"
---

# `Protocol`: `serveDirectory()` method

The **`serveDirectory()`** method registers a directory as a custom protocol: in web pages in this partition created afterward, an address like `scheme://host/path` gets its file from this directory.

## Syntax

```
serveDirectory(scheme, directory)
```

### Parameters

**`scheme`**

The protocol name, a string, without `://`. `app` is recommended.

- Starts with a lowercase letter and contains only lowercase letters, digits, `+`, `-`, and `.`.
- Can't be a protocol WebKit handles itself, such as `https` or `file`. WebKit is the engine iOS uses to display web pages.
- Non-strings are converted to strings first. `null` and `undefined` become an empty string, which is invalid.

**`directory`**

The path of the directory, a string.

- A relative path starts from the root of the app bundle, the same as [`loadFile()`](../web-contents/loadfile.md). The project's `assets/web/` is `'JS/assets/web'` in the app bundle. The app bundle is the directory installed on the device that holds the app's program and the resource files bundled with it; it is read-only.
- A path starting with `/` is absolute and used as is, such as `application.fileSystem.assets + '/web'`.
- The directory must already exist at the time of the call.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

| Case | Error |
| --- | --- |
| The protocol name is invalid: has uppercase letters, starts with a digit, has a space, or is empty | `serveDirectory: "Nacre" is not a valid scheme; use lowercase letters, digits, +, - and ., starting with a letter` |
| The protocol is one WebKit handles itself, such as `https` or `file` | `serveDirectory: "https" is handled by WebKit itself; pick another scheme, like app` |
| `directory` is an empty string | `serveDirectory: the directory must be a non-empty string` |
| The directory doesn't exist, or a file was given | `serveDirectory: "JS/assets/no-such-dir" is not a directory` |

The protocol name and path in the message are the values passed in. When it throws, this partition's existing registration is unaffected.

## Description

### When it takes effect

- It applies only to [`WebView`](../web-view.md)s in this partition **created afterward**. A page created before the registration that loads an address of this protocol: [`loadURL()`](../web-contents/loadurl.md) rejects.
- It applies only to this partition. A page in another partition that loads an address of this protocol: `loadURL()` rejects.
- Calling it again for the same protocol switches to the new directory. Pages created earlier keep using the original directory; pages created afterward use the new one.

### How addresses map to files

- The address's path is appended to the directory: `app://local/js/main.js` gets `directory/js/main.js`. References in the page that start with `/` (`/data.json`) are resolved from the root of the directory.
- The host doesn't take part in finding the file. It decides the page's origin: the `location.origin` of `app://local/index.html` is `'app://local'`. A different host is a different origin. Use `app://local/` throughout the app.
- The query string (the part after `?`) doesn't take part in finding the file: `/data.json?x=1` gets `data.json`.
- When the path is a directory, the `index.html` inside it is returned, with or without a trailing `/`.
- A path can't leave the directory. A request that uses an encoded `..` (`%2e%2e`) to go outside the directory gets 404.

### Responses

| Request | Response |
| --- | --- |
| `GET`, the file exists | Status 200. The body is the whole file, with `Content-Type` and `Content-Length` (the file's size in bytes) |
| `GET`, the file doesn't exist | Status 404. The body is the plain text `Not Found` |
| `HEAD` | Same status and headers as `GET`, no body |
| `POST` and other methods | Status 405. The body is the plain text `Method Not Allowed` |
| A range request with a `Range` header | Not split: the whole file is returned with status 200 |

`Content-Type` is decided by the extension, case-insensitively:

| Extension | `Content-Type` |
| --- | --- |
| `.html`, `.htm` | `text/html` |
| `.js`, `.mjs` | `text/javascript` |
| `.css` | `text/css` |
| `.json`, `.map` | `application/json` |
| `.wasm` | `application/wasm` |
| `.svg` | `image/svg+xml` |
| `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | `image/png`, `image/jpeg`, `image/jpeg`, `image/gif`, `image/webp` |
| `.ico` | `image/x-icon` |
| `.woff`, `.woff2`, `.ttf`, `.otf` | `font/woff`, `font/woff2`, `font/ttf`, `font/otf` |
| `.txt` | `text/plain` |
| `.xml` | `application/xml` |
| `.mp4`, `.mp3`, `.wav` | `video/mp4`, `audio/mpeg`, `audio/wav` |
| Others | `application/octet-stream` |

When `<video>` or `<audio>` in a page plays a file under this protocol, dragging the progress bar uses range requests and may not work (**not verified on a device**).

### The main page's status code

On the [`did-navigate`](../web-contents/did-navigate-event.md) event, the main page's `httpResponseCode` is `-1`; it doesn't show 200 or 404. When the main page's file doesn't exist, `loadURL()` still fulfills, and the page shows `Not Found`. A `fetch` request inside the page gets the real status in `status`.

## Examples

### Using module scripts and fetch in the page

```js
const protocol = session.defaultSession.protocol;
protocol.serveDirectory('app', 'JS/assets/web');

const contents = new WebView().webContents;
await contents.loadURL('app://local/index.html');
const status = await contents.executeJavaScript("fetch('/data.json').then((r) => r.status)");
console.log(status);
```

**Effect**

- When the project's `assets/web/` has `index.html` and `data.json`, the console prints `200`.
- `<script type="module">` in `index.html` runs.

### Registering in another partition

```js
const shop = session.fromPartition('persist:shop');
shop.protocol.serveDirectory('app', 'JS/assets/shop');

const inShop = new WebView({ webPreferences: { partition: 'persist:shop' } });
await inShop.webContents.loadURL('app://local/index.html');
console.log(session.defaultSession.protocol.isProtocolHandled('app'));
```

**Effect**

- `inShop` shows `assets/shop/index.html`.
- The console prints `false`: the default partition hasn't registered `app`. A page in the default partition that loads `app://local/index.html`: `loadURL()` rejects.

## Differences from Electron

Electron has no such method. Electron uses `protocol.handle(scheme, handler)`, where JS returns content for each request, and the protocol must also be declared with `protocol.registerSchemesAsPrivileged()` before the app starts to get its own origin. Here a directory decides what is returned, and after registration pages have their own origin right away.

## Corresponding iOS API

`-[WKWebViewConfiguration setURLSchemeHandler:forURLScheme:]`, plus a `WKURLSchemeHandler` that reads files from a directory. After registration, it is attached to the page's configuration at `new WebView()`.

## See also

- [`unhandle()`](unhandle.md): removes the registration
- [`isProtocolHandled()`](isprotocolhandled.md): reads whether it is registered
- [Loading local web pages through a custom protocol](../../guides/web-pages.md#loading-local-web-pages-through-a-custom-protocol)
- [`application.fileSystem.assets`](../filesystem/assets.md): the absolute path of the project's `assets/` in the app bundle
