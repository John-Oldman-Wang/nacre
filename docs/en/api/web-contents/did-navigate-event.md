---
type: reference
native: "webView:didCommitNavigation:"
---

# `WebContents`: `did-navigate` event

The **`did-navigate`** event fires when the web page switches to a new document. At that point the new URL is settled and the server's status code is known.

## Syntax

```
contents.addEventListener('did-navigate', (event) => {})
```

## Event object

`WebContentsDidNavigateEvent`. Besides `type` and `target`, it has two fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | string | The new URL |
| `httpResponseCode` | number | The HTTP status code. `-1` for `data:`, `about:`, local files, custom protocols registered with [`serveDirectory()`](../protocol/servedirectory.md), and others that don't go through HTTP. Also `-1` when going back or forward to a previously loaded page: the server isn't requested again then |

Not cancelable.

## When it fires

In a successful load it comes after `did-start-loading` and before `did-stop-loading`. It fires as usual when the server returns 404 or 500, with the status code in `httpResponseCode`. It doesn't fire when loading fails (a network-level error).

Whether you can go back or forward may change after each `did-navigate`; read [`navigationHistory`](navigationhistory.md) again in this event.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', (e) => {
  if (e.httpResponseCode >= 400) console.log('Server returned', e.httpResponseCode);
});
contents.loadURL('https://example.com/no-such-page');
```

**Effect**: When the server returns 404, it prints `Server returned 404`.

## Differences from Electron

Electron writes `contents.on('did-navigate', (event, url, httpResponseCode, httpStatusText) => …)`; here the data is on the event object. There is no `httpStatusText`: the system doesn't provide it.

The native iOS equivalent is `webView:didCommitNavigation:`.

## See also

- [`getURL()`](geturl.md)
- [Handling load failures](../../guides/web-pages.md#handling-load-failures)
