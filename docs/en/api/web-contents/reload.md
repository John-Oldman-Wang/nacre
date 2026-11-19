---
type: reference
native: "-[WKWebView reload]"
---

# `WebContents`: `reload()` method

The **`reload()`** method reloads the current URL.

## Syntax

```
reload()
```

### Parameters

None.

### Return value

None (`undefined`). To know the outcome of the load, listen for [`did-finish-load`](did-finish-load-event.md) and [`did-fail-load`](did-fail-load-event.md).

### Exceptions

**`TypeError`**

The page has been destroyed: `Object has been destroyed`.

## Description

- Fires a round of loading events, just like `loadURL()`. Doesn't fire `will-navigate`.
- When the page's process is gone ([`isCrashed()`](iscrashed.md) is `true`), `reload()` makes the page load again and display again. The page's previous state (a half-filled form, variables in scripts) isn't restored.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('render-process-gone', () => {
  contents.reload();
});
```

**Effect**: When the page's process is terminated, the page reloads and displays again.

## Differences from Electron

Same as Electron's `contents.reload()`. The native iOS equivalent is `[webView reload]`.

## See also

- [`render-process-gone`](render-process-gone-event.md)
