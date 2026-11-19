---
type: reference
native: "webView:didFinishNavigation:"
---

# `WebContents`: `did-finish-load` event

The **`did-finish-load`** event fires when the web page finishes loading.

## Syntax

```
contents.addEventListener('did-finish-load', (event) => {})
```

## Event object

`Event`, with no extra fields. Not cancelable.

## When it fires

It is the last event of a successful load, after `did-stop-loading`. Error pages the server returns with 404 or 500 finish loading as usual and fire it too.

Whether the page's title or "finished loading" arrives first isn't fixed. If you need the title, listen for [`page-title-updated`](page-title-updated-event.md) instead of reading `getTitle()` here.

## Examples

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.addEventListener('did-finish-load', () => {
  web.webContents.send('theme', 'dark');
});
web.webContents.loadURL('https://my.app/');
```

**Effect**: After the page finishes loading, the app sends a `theme` message to the preload script. A message sent earlier than this may have no one to receive it.

## Differences from Electron

Same as Electron's `did-finish-load`. The native iOS equivalent is `webView:didFinishNavigation:`.

## See also

- [`loadURL()`](loadurl.md): the Promise it returns is also fulfilled when loading finishes
