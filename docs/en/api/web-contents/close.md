---
type: reference
native: WKWebView
---

# `WebContents`: `close()` method

The **`close()`** method destroys the web page. The page's process exits and the memory it used is freed.

## Syntax

```
close()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None. Calling it again on a destroyed page does nothing.

## Description

- Right after the call, [`isDestroyed()`](isdestroyed.md) is `true`; then [`destroyed`](destroyed-event.md) fires.
- The page disappears from the screen. The `WebView` is still a view, just empty. When you no longer need it, remove it from the interface like any other view.
- After that, every method other than `close()` and `isDestroyed()` throws `TypeError: Object has been destroyed`.
- A `loadURL` still in progress at destruction has its Promise rejected with `AbortError`.
- All `ipcRenderer.invoke` requests from the page that haven't been answered are rejected.
- Destruction can't be undone. To show a web page again, create a new `WebView`.

A simple web page measured about 60 MB in the simulator. For when a page is freed if you don't call `close()`, see [Memory and references](../web-view.md#memory-and-references).

## Examples

```js
const web = new WebView();
const contents = web.webContents;
contents.addEventListener('destroyed', () => console.log('Destroyed'));
contents.close();
console.log(contents.isDestroyed());
web.removeFromSuperview();
```

**Result**: It first prints `true`, then `Destroyed`.

## Differences from Electron

Same as Electron's `contents.close()`. The native iOS equivalent is releasing the `WKWebView`.

## See also

- [`destroyed`](destroyed-event.md)
- [Memory and references](../web-view.md#memory-and-references)
