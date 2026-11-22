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

A `loadURL()` that hasn't fulfilled yet rejects with a [`DOMException`](../dom-exception.md) whose `name` is `'AbortError'` and whose `code` is 20. The system's original error is on `cause` (an [`NSError`](../ns-error.md)), and `cause.code` is `-999`. Calling it while nothing is loading does nothing.

> **Note:** Calling `stop()` right after `loadURL` rejects the Promise with `AbortError` but **doesn't fire** `did-fail-load`.

### Exceptions

**`TypeError`**

The page has been destroyed: `Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
const loading = contents.loadURL('https://example.com/big');
contents.stop();
loading.catch((err) => {
  const systemCode = err.cause instanceof NSError ? err.cause.code : null;
  console.log(err.name, err.code, systemCode);
});
```

**Result**: It prints `AbortError 20 -999`.

## Differences from Electron

Same as Electron's `contents.stop()`. The native iOS equivalent is `[webView stopLoading]`.

## See also

- [`loadURL()`](loadurl.md)
