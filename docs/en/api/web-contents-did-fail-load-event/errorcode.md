---
type: reference
native: WebContentsDidFailLoadEvent.errorCode
---

# `WebContentsDidFailLoadEvent`: `errorCode` property

The **`errorCode`** property is the system error code.

## Value

A number. Common ones:

- Read-only. Assigning to it throws `TypeError`.
- `-1003`: the host name couldn't be resolved.
- `-1009`: no network.
- `-1001`: timed out.
- `-999`: canceled (stopped by `stop()`, or replaced by another load).
- For others, see [`did-fail-load`](../web-contents/did-fail-load-event.md).
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  if (e.errorCode === -1009) console.log('没有网络');
});
contents.loadURL('https://example.com').catch(() => {});
```

**Effect**: loading without a network prints `没有网络`.

## Corresponding iOS API

`error.code` in `webView:didFailNavigation:withError:` and `webView:didFailProvisionalNavigation:withError:`.

## See also

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
