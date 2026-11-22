---
type: reference
native: "webView:didFailNavigation:withError:"
---

# `WebContents`: `did-fail-load` event

The **`did-fail-load`** event fires when the web page fails to load.

## Syntax

```
contents.addEventListener('did-fail-load', (event) => {})
```

## Event object

[`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md). Besides `type` and `target`, it has four fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`errorCode`](../web-contents-did-fail-load-event/errorcode.md) | number | The system's error code; see below |
| [`errorDescription`](../web-contents-did-fail-load-event/errordescription.md) | string | The description the system gives. Its language follows the system; it is only suitable for logging |
| [`validatedURL`](../web-contents-did-fail-load-event/validatedurl.md) | string | The URL that failed to load |
| [`isMainFrame`](../web-contents-did-fail-load-event/ismainframe.md) | boolean | Always `true`. Load failures of an `<iframe>` in the page don't fire this event |

Common `errorCode` values:

| Value | Meaning |
| --- | --- |
| `-1003` | The domain name can't be resolved |
| `-1009` | No network |
| `-1001` | Timed out |
| `-1022` | Plain-text `http://` was blocked |
| `-1002` | Unrecognized scheme, such as a `tel:` link that wasn't intercepted |
| `-1100` | The local file doesn't exist |
| `-999` | Canceled (stopped by `stop()`, or superseded by another load) |
| `102` | The loaded content can't be displayed, such as an archive or a directory |

Not cancelable.

## When it fires

- When a load the app started fails, at the same time as the `loadURL()` Promise is rejected; both carry the same information: `errorCode` is the same number as `cause.code` on the rejection error (measured).
- When a load caused by the user tapping a link fails, it also fires.
- A server returning 404 or 500 **is not a failure** and doesn't fire it.

> **Note:** Calling `stop()` right after `loadURL` rejects the Promise with `AbortError` but **doesn't fire** `did-fail-load`. To know the outcome of a `loadURL` call, rely on its Promise.

After a failure, the page stays on the previous page; it doesn't go blank and no error page is shown. To tell the user the load failed, show a message yourself.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log('Load failed', e.errorCode, e.validatedURL);
});
contents.loadURL('https://no-such-host.invalid/');
```

**Result**: It prints `Load failed -1003 https://no-such-host.invalid/`.

## Differences from Electron

Electron writes `contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => …)`; here the data is on the event object, with the same field names. The error codes are the system's set (`-1003` and so on), not Chromium's (`-105` and so on).

The native iOS equivalents are `webView:didFailNavigation:withError:` and `webView:didFailProvisionalNavigation:withError:`.

## See also

- [`loadURL()`](loadurl.md)
- [Handling load failures](../../guides/web-pages.md#handling-load-failures)
