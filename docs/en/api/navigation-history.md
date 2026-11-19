---
type: reference
native: WKBackForwardList
---

# `NavigationHistory`

**`NavigationHistory`** represents a web page's back and forward navigation: whether it can go back or forward, and going back or forward one page.

It is obtained from [`webContents.navigationHistory`](web-contents/navigationhistory.md); each web page has only one.

**Inheritance**: `NavigationHistory` (doesn't inherit from `EventTarget`; has no events)

## Constructor

It can't be created with `new`: that throws `TypeError: Illegal constructor: NavigationHistory is created by the runtime, not by new`. Get it from [`webContents.navigationHistory`](web-contents/navigationhistory.md).

## Instance methods

| Method | Description |
| --- | --- |
| [`canGoBack()`](navigation-history/cangoback.md) | Whether it can go back |
| [`canGoForward()`](navigation-history/cangoforward.md) | Whether it can go forward |
| [`goBack()`](navigation-history/goback.md) | Goes back one page |
| [`goForward()`](navigation-history/goforward.md) | Goes forward one page |

Whether it can go back or forward may change after each [`did-navigate`](web-contents/did-navigate-event.md); read it again in that event.

After the web page is destroyed, all four methods throw `TypeError: Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
const history = contents.navigationHistory;
contents.addEventListener('did-navigate', () => {
  console.log('canGoBack', history.canGoBack(), 'canGoForward', history.canGoForward());
});
await contents.loadURL('https://example.com/');
await contents.loadURL('https://example.com/about');
history.goBack();
```

**Result**: Prints `canGoBack false canGoForward false`, `canGoBack true canGoForward false`, and `canGoBack false canGoForward true` in order.

## Comparison with Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `contents.navigationHistory.canGoBack()` / `canGoForward()` | Same | |
| `contents.navigationHistory.goBack()` / `goForward()` | Same | |

## Corresponding iOS API

| ObjC (`WKWebView`) | JS |
| --- | --- |
| `webView.canGoBack` / `canGoForward` | `canGoBack()` / `canGoForward()` |
| `[webView goBack]` / `[webView goForward]` | `goBack()` / `goForward()` |

## See also

- [`WebContents`](web-contents.md): where this object is obtained from
- [Back, forward, and reload](../guides/web-pages.md#back-forward-and-reload)
