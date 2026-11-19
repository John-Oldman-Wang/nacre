---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `WebContentsIPC`

**`WebContentsIPC`** represents the app's end of a web page's request-response channel. The web page's preload script sends requests with [`ipcRenderer.invoke()`](ipc-renderer/invoke.md), and the app answers with handler functions registered on this object; a handler's return value is the result the web page gets.

You get it from [`webContents.ipc`](web-contents/ipc.md); there is only one per web page. One-way messages the web page sends with `ipcRenderer.send()` don't go through it; receive those in the [`ipc-message`](web-contents/ipc-message-event.md) event.

**Inheritance**: `WebContentsIPC` (doesn't inherit from `EventTarget`; has no events)

For how to let a web page ask the app for a result, see the guide [Sending messages between a web page and the app](../guides/web-page-messaging.md#having-the-page-ask-the-app-for-a-result).

## Constructor

Can't be created with `new`: it throws `TypeError: Illegal constructor: this object is created by the runtime, not by new`. Get it from [`webContents.ipc`](web-contents/ipc.md).

## Instance methods

| Method | Description |
| --- | --- |
| [`handle()`](web-contents-ipc/handle.md) | Registers a handler for a channel |
| [`removeHandler()`](web-contents-ipc/removehandler.md) | Removes a channel's handler |

Each channel can have only one handler. When the web page is destroyed, all requests not yet answered are rejected on the web page's side.

## Examples

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.ipc.handle('get-user', async (event) => {
  if (!event.sender.getURL().startsWith('https://my.app/')) throw new Error('not allowed');
  return { name: application.storage.get('name') };
});
```

**Effect**: When the web page is under `https://my.app/`, `await ipcRenderer.invoke('get-user')` in the preload script gets `{ name: … }`. On other sites, the web page's side is rejected with the message `Error invoking remote method 'get-user': Error: not allowed`.

## Comparison with Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `contents.ipc.handle(channel, listener)` | Same | The handler's `event` has only `sender` |
| `contents.ipc.removeHandler(channel)` | Same | |
| `contents.ipc.on(channel, listener)` | Not available | Use the `ipc-message` event for one-way messages |

## Corresponding iOS API

`WKScriptMessageHandlerWithReply`: the web page's `postMessage` gets a Promise, and the app replies with `replyHandler`.

## See also

- [`ipcRenderer.invoke()`](ipc-renderer/invoke.md): how the web page's end sends a request
- [`WebContents`](web-contents.md)
