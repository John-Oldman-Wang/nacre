---
type: reference
native: WKWebView
---

# `WebView`: `webContents` property

The **`webContents`** property is the web page inside the view. Loading URLs, going back and forward, listening to the loading process, running scripts in the page, and exchanging messages with the page all happen on it.

## Value

A [`WebContents`](../web-contents.md).

- Read-only; assigning to it throws `TypeError`.
- Created together with the `WebView`; every read returns the same object.
- After the web page is destroyed with [`close()`](../web-contents/close.md), reading it still returns this object, whose [`isDestroyed()`](../web-contents/isdestroyed.md) returns `true`.

## Examples

```js
const web = new WebView();
const contents = web.webContents;
console.log(contents === web.webContents, contents.getURL() === '');
```

**Result**: Prints `true true`. A web page that has never loaded has an empty URL.

## Differences from Electron

The same as Electron's `view.webContents`.

## See also

- [`WebContents`](../web-contents.md)
