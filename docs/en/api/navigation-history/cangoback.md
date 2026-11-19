---
type: reference
native: WKWebView.canGoBack
---

# `NavigationHistory`: `canGoBack()` method

The **`canGoBack()`** method returns whether the web page can go back right now.

## Syntax

```
canGoBack()
```

### Parameters

None.

### Return value

A boolean.

- `true`: it can go back; calling [`goBack()`](goback.md) goes back one page.
- `false`: it can't go back; calling `goBack()` does nothing.

There is no change notification. It may change after each [`did-navigate`](../web-contents/did-navigate-event.md); read it again in that event.

### Exceptions

**`TypeError`**

The web page has been destroyed: `Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', () => {
  console.log(contents.navigationHistory.canGoBack());
});
```

**Effect**: Each time the web page changes document, prints whether it can go back now.

## Differences from Electron

Same as Electron's `navigationHistory.canGoBack()`. The corresponding native iOS member is `WKWebView.canGoBack`.

## See also

- [`goBack()`](goback.md)
