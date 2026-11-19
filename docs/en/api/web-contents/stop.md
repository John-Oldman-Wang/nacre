---
type: reference
native: "-[WKWebView stopLoading]"
---

# `WebContents`: `stop()` method

The **`stop()`** method stops the load in progress. The page stays on the previous page.

## Syntax

```
stop()
```

### Parameters

None.

### Return value

None (`undefined`).

A `loadURL()` that hasn't fulfilled yet rejects with an error whose `name` is `'AbortError'` and `code` is `-999`. Calling it while nothing is loading does nothing.

> **Note:** Calling `stop()` right after `loadURL` rejects the Promise with `AbortError` but **doesn't fire** `did-fail-load`.

### Exceptions

**`TypeError`**

The page has been destroyed: `Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
const loading = contents.loadURL('https://example.com/big');
contents.stop();
loading.catch((err) => console.log(err.name, err.code));
```

**Result**: It prints `AbortError -999`.

## Differences from Electron

Same as Electron's `contents.stop()`. The native iOS equivalent is `[webView stopLoading]`.

## See also

- [`loadURL()`](loadurl.md)
