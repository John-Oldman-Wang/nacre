---
type: reference
native: "-[WKWebView goForward]"
---

# `NavigationHistory`: `goForward()` method

The **`goForward()`** method makes the web page go forward one page.

## Syntax

```
goForward()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The web page has been destroyed: `Object has been destroyed`.

Calling it when the page can't go forward does nothing and doesn't throw.

## Description

- Going forward fires a round of loading events. It doesn't fire [`will-navigate`](../web-contents/will-navigate-event.md).
- When returning to a page loaded earlier, `httpResponseCode` on [`did-navigate`](../web-contents/did-navigate-event.md) is `-1`: the server wasn't requested again.

## Examples

```js
const history = new WebView().webContents.navigationHistory;
if (history.canGoForward()) history.goForward();
```

**Effect**: Goes forward one page when possible; otherwise does nothing.

## Differences from Electron

Same as Electron's `navigationHistory.goForward()`. The corresponding native iOS code is `[webView goForward]`.

## See also

- [`canGoForward()`](cangoforward.md)
