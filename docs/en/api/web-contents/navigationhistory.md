---
type: reference
native: WKWebView.backForwardList
---

# `WebContents`: `navigationHistory` property

The **`navigationHistory`** property is this web page's back and forward history.

## Value

A [`NavigationHistory`](../navigation-history.md).

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.

## Examples

```js
const contents = new WebView().webContents;
const history = contents.navigationHistory;
console.log(history === contents.navigationHistory, history.canGoBack());
```

**Result**: It prints `true false`. No page has loaded yet, so it can't go back.

## Differences from Electron

Same as Electron's `contents.navigationHistory`, with only four methods: `canGoBack()`, `canGoForward()`, `goBack()`, and `goForward()`. The corresponding native iOS members are the `canGoBack` and `goBack` group on `WKWebView`.

## See also

- [`NavigationHistory`](../navigation-history.md)
