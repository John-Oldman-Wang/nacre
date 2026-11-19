---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `WebContents`: `ipc` property

The **`ipc`** property answers requests that the web page's preload script sends with [`ipcRenderer.invoke()`](../ipc-renderer/invoke.md).

## Value

A [`WebContentsIPC`](../web-contents-ipc.md).

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.
- It handles only requests and replies. One-way messages the page sends with `ipcRenderer.send()` don't go through it; receive them in the [`ipc-message`](ipc-message-event.md) event.

## Examples

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.ipc.handle('get-version', () => '1.0.0');
```

**Effect**: In the page's preload script, `await ipcRenderer.invoke('get-version')` gets `'1.0.0'`.

## Differences from Electron

Electron's `contents.ipc` is an `IpcMain` scoped to this page, with methods such as `on` and `handle`. Here there is only the request-and-reply half: `handle()` and `removeHandler()`. Use the `ipc-message` event for one-way messages.

## See also

- [`WebContentsIPC`](../web-contents-ipc.md)
- [Letting the page ask the app for a result](../../guides/web-page-messaging.md#having-the-page-ask-the-app-for-a-result)
