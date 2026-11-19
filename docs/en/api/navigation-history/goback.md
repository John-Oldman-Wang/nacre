---
type: reference
native: "-[WKWebView goBack]"
---

# `NavigationHistory`: `goBack()` method

The **`goBack()`** method makes the web page go back one page.

## Syntax

```
goBack()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The web page has been destroyed: `Object has been destroyed`.

Calling it when the page can't go back does nothing and doesn't throw.

## Description

- Going back fires a round of loading events. It doesn't fire [`will-navigate`](../web-contents/will-navigate-event.md).
- When returning to a page loaded earlier, `httpResponseCode` on [`did-navigate`](../web-contents/did-navigate-event.md) is `-1`: the server wasn't requested again.

## Examples

```js
const history = new WebView().webContents.navigationHistory;
if (history.canGoBack()) history.goBack();
```

**Effect**: Goes back one page when possible; otherwise does nothing.

## Differences from Electron

Same as Electron's `navigationHistory.goBack()`. The corresponding native iOS code is `[webView goBack]`.

## See also

- [`canGoBack()`](cangoback.md)
