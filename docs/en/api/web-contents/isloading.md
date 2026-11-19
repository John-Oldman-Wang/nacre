---
type: reference
native: WKWebView.loading
---

# `WebContents`: `isLoading()` method

The **`isLoading()`** method returns whether the web page is loading.

## Syntax

```
isLoading()
```

### Parameters

None.

### Return value

A boolean.

- `true`: loading. It is `true` immediately after calling `loadURL()`.
- `false`: not loading.

[`did-start-loading`](did-start-loading-event.md) fires when it becomes `true`, and [`did-stop-loading`](did-stop-loading-event.md) fires when it goes back to `false`.

### Exceptions

**`TypeError`**

The page has been destroyed: `Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
contents.loadURL('https://example.com/');
console.log(contents.isLoading());
contents.addEventListener('did-stop-loading', () => console.log(contents.isLoading()));
```

**Result**: It first prints `true`, and prints `false` after loading ends.

## Differences from Electron

Same as Electron's `contents.isLoading()`. The corresponding native iOS member is `WKWebView.loading`.

## See also

- [`did-start-loading`](did-start-loading-event.md), [`did-stop-loading`](did-stop-loading-event.md)
