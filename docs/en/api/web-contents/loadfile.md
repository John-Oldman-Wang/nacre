---
type: reference
native: "-[WKWebView loadFileURL:allowingReadAccessToURL:]"
---

# `WebContents`: `loadFile()` method

The **`loadFile()`** method makes the web page load a local web page file: one bundled into the app bundle, or one the app wrote to the device itself.

## Syntax

```
loadFile(filePath)
loadFile(filePath, { query, search, hash })
```

### Parameters

**`filePath`**

The path of the web page file, a string. A relative path starts from the root of the app bundle (such as `'JS/web/help.html'`); a path starting with `/` is absolute (such as `application.fileSystem.documents + '/pages/notice.html'`). The app bundle is the directory installed on the device that holds the app's program and the resource files bundled with it; it is read-only.

**`options.query`**

An object for the part of the URL after `?`, given as key-value pairs: `{ a: '1' }` gives `?a=1`. Optional.

**`options.search`**

A string for the part of the URL after `?`, given directly. The leading `?` is optional. When both this and `query` are given, this one is used. Optional.

**`options.hash`**

A string for the part of the URL after `#`. The leading `#` is optional. Optional.

### Return value

`Promise<void>`. When it fulfills or rejects, and which events fire, are the same as for [`loadURL()`](loadurl.md). Only the error cases differ:

| Case | Result |
| --- | --- |
| `filePath` is an empty string | Rejects with `TypeError`: `loadFile: the path is empty` |
| The file doesn't exist | Rejects with an error whose `name` is `'NetworkError'` and `code` is `-1100`; `did-fail-load` fires at the same time |
| The path is a directory | Rejects with an error whose `name` is `'Error'` and `code` is `102`; `did-fail-load` fires at the same time |

> **Note:** The last case (and loading a file that can't be displayed, such as an archive, with `loadURL`) takes more than 4 seconds to report the failure on iOS 27; on iOS 26 it is immediate.

### Exceptions

Doesn't throw directly. All errors reject the returned Promise.

## Description

The loaded page has a URL starting with `file://`. The page can reference stylesheets, classic scripts, and images in the same directory and its subdirectories by relative path.

In a local web page, `<script type="module">` doesn't run, and `fetch` can't read local files. For all the limits, see [Limits of local web pages](../web-contents.md#limits-of-local-web-pages).

## Examples

### Loading a page from the bundle

```js
const contents = new WebView().webContents;
await contents.loadFile('JS/web/help.html');
console.log(contents.getURL());

// With the parts after ? and #
await contents.loadFile('JS/web/help.html', { query: { topic: 'fees' }, hash: 'refund' });
```

**Effect**

- It displays without a network connection.
- The console prints a URL that starts with `file:///` and ends with `/JS/web/help.html`.
- On the second load, `location.search` in the page is `?topic=fees` and `location.hash` is `#refund`.

### Loading a page the app wrote

```js
const contents = new WebView().webContents;
const dir = application.fileSystem.documents + '/pages';
await application.fileSystem.makeDirectory(dir);
await application.fileSystem.writeText(dir + '/notice.html', '<h1>Notice</h1>');
await contents.loadFile(dir + '/notice.html');
```

**Effect**: The page shows "Notice". It can reference files in the `pages` directory and its subdirectories by relative path, but not files outside it (on a device; the simulator doesn't enforce this limit).

## Differences from Electron

Same as Electron's `contents.loadFile(filePath, { query, search, hash })`. Relative paths start from the app bundle. Local web pages have more limits than in Electron; see [Limits of local web pages](../web-contents.md#limits-of-local-web-pages).

The native iOS equivalent is `[webView loadFileURL:allowingReadAccessToURL:]`. The runtime decides the readable directory from the file's location; you can't specify it yourself.

## See also

- [`loadURL()`](loadurl.md)
- [Loading a page bundled into the app](../../guides/web-pages.md#loading-web-pages-bundled-in-the-app)
- [File system](../filesystem.md): writing web page files into the app's directories
