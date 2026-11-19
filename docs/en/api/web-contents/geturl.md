---
type: reference
native: WKWebView.URL
---

# `WebContents`: `getURL()` method

The **`getURL()`** method returns the current web page's URL.

## Syntax

```
getURL()
```

### Parameters

None.

### Return value

A string. Empty string if nothing has loaded yet.

[`did-navigate`](did-navigate-event.md) fires when the URL changes, and the event's `url` is the new URL. When loading fails the URL doesn't change; it stays on the previous page.

### Exceptions

**`TypeError`**

The page has been destroyed: `Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
console.log(JSON.stringify(contents.getURL()));
await contents.loadURL('https://example.com/');
console.log(contents.getURL());
```

**Result**: It first prints `""`, and after loading prints `https://example.com/`.

## Differences from Electron

Same as Electron's `contents.getURL()`. The corresponding native iOS member is `WKWebView.URL`.

## See also

- [`did-navigate`](did-navigate-event.md)
