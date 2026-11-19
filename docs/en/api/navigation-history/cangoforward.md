---
type: reference
native: WKWebView.canGoForward
---

# `NavigationHistory`: `canGoForward()` method

The **`canGoForward()`** method returns whether the web page can go forward right now.

## Syntax

```
canGoForward()
```

### Parameters

None.

### Return value

A boolean.

- `true`: it can go forward; calling [`goForward()`](goforward.md) goes forward one page.
- `false`: it can't go forward; calling `goForward()` does nothing.

There is no change notification. It may change after each [`did-navigate`](../web-contents/did-navigate-event.md); read it again in that event.

### Exceptions

**`TypeError`**

The web page has been destroyed: `Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', () => {
  console.log(contents.navigationHistory.canGoForward());
});
```

**Effect**: Each time the web page changes document, prints whether it can go forward now.

## Differences from Electron

Same as Electron's `navigationHistory.canGoForward()`. The corresponding native iOS member is `WKWebView.canGoForward`.

## See also

- [`goForward()`](goforward.md)
