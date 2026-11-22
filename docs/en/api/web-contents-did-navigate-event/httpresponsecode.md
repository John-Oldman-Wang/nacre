---
type: reference
native: WebContentsDidNavigateEvent.httpResponseCode
---

# `WebContentsDidNavigateEvent`: `httpResponseCode` property

The **`httpResponseCode`** property is the HTTP status code.

## Value

A number.

- Read-only. Assigning to it throws `TypeError`.
- When the server returns 404 or 500, the event is fired as usual and the status code is here.
- It is `-1` for loads that don't go through HTTP, such as `data:`, `about:`, and local files.
- It is also `-1` when going back or forward to a page loaded earlier: the server wasn't asked again.
- When the event is created with [`new`](constructor.md) without it, it is `-1`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', (e) => {
  if (e.httpResponseCode >= 400) console.log('服务器返回了', e.httpResponseCode);
});
contents.loadURL('https://example.com/no-such-page');
```

**Effect**: prints `服务器返回了 404`.

## Corresponding iOS API

`statusCode` of `navigationResponse.response` in `webView:decidePolicyForNavigationResponse:decisionHandler:`.

## See also

- [`WebContentsDidNavigateEvent`](../web-contents-did-navigate-event.md)
