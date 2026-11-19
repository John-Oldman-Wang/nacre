---
type: reference
native: WKWebView.loading
---

# `WebContents`: `did-stop-loading` event

The **`did-stop-loading`** event fires when the web page stops loading. It fires whether the load succeeds, fails, or is stopped.

## Syntax

```
contents.addEventListener('did-stop-loading', (event) => {})
```

## Event object

`Event`, with no extra fields. Not cancelable.

## When it fires

It comes in pairs with [`did-start-loading`](did-start-loading-event.md). In a successful load it comes after `did-navigate` and before `did-finish-load`. After it fires, [`isLoading()`](isloading.md) is `false`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-stop-loading', () => console.log(contents.isLoading()));
contents.loadURL('https://example.com/');
```

**Result**: After loading ends, it prints `false`.

## Differences from Electron

Same as Electron's `did-stop-loading`. The native iOS equivalent is `WKWebView.loading` becoming `NO`.

## See also

- [`did-start-loading`](did-start-loading-event.md)
