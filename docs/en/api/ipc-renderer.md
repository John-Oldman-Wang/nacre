---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `ipcRenderer`

**`ipcRenderer`** represents the web page's end of the message channel: the page uses it to send messages to the app, ask the app for results, and receive messages from the app.

It is only available in a [preload script](web-view.md#preload-scripts). A preload script is a JS file specified with `webPreferences.preload` when creating a `WebView`, and it runs inside the web page. `ipcRenderer` is a name directly available in the preload script, not a global of the page: in the page's own scripts, `typeof ipcRenderer` is `'undefined'`. It is not in the app's `main.js` either.

A preload script usually uses [`contextBridge.exposeInMainWorld()`](context-bridge/exposeinmainworld.md) to attach a few specific methods to the page's `window`, and those methods call `ipcRenderer`.

The app's end is [`webContents`](web-contents.md): messages sent with `send()` are received in the [`ipc-message`](web-contents/ipc-message-event.md) event, requests sent with `invoke()` are answered by [`webContents.ipc.handle()`](web-contents-ipc/handle.md), and messages the app sends with [`webContents.send()`](web-contents/send.md) are received by `on()`.

For how to set up this channel, see the guide [Messaging between a web page and the app](../guides/web-page-messaging.md).

> **Note:** The preload script and the page's scripts are not isolated. Any script in the page can send messages into the channel directly without going through `ipcRenderer`, and can also impersonate the app so that listeners registered with `on()` receive fake messages. See [Preload scripts](web-view.md#preload-scripts).

## Functions

`ipcRenderer` is an object; these are its methods.

Sending messages to the app:

| Method | Description |
| --- | --- |
| [`send()`](ipc-renderer/send.md) | Sends a message to the app without waiting for a reply |
| [`invoke()`](ipc-renderer/invoke.md) | Asks the app for a result, returning a Promise |

Receiving messages from the app:

| Method | Description |
| --- | --- |
| [`on()`](ipc-renderer/on.md) | Receives messages on a channel |
| [`addListener()`](ipc-renderer/addlistener.md) | Same as `on()` |
| [`once()`](ipc-renderer/once.md) | Receives messages on a channel, only once |
| [`off()`](ipc-renderer/off.md) | Stops receiving |
| [`removeListener()`](ipc-renderer/removelistener.md) | Same as `off()` |
| [`removeAllListeners()`](ipc-renderer/removealllisteners.md) | Removes the listeners for one channel (or all channels) |

Message arguments and results are passed as JSON; see [How values are passed](web-contents.md#how-values-are-passed).

## Examples

The preload script `JS/web/preload.js`:

```javascript
contextBridge.exposeInMainWorld('app', {
  share: (id) => ipcRenderer.send('share', id),
  getUser: () => ipcRenderer.invoke('get-user'),
});
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

On the app side:

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
const contents = web.webContents;
contents.addEventListener('ipc-message', (e) => {
  if (e.channel === 'share') console.log('The page wants to share', e.args[0]);
});
contents.ipc.handle('get-user', () => ({ name: 'Jack' }));
contents.addEventListener('did-finish-load', () => contents.send('theme', 'dark'));
```

**Effect**

- When the page calls `app.share(42)`, the app's console prints `The page wants to share 42`.
- In the page, `await app.getUser()` gives `{ name: 'Jack' }`.
- After the page finishes loading, `<html>` gains `data-theme="dark"`.

The preload script's code runs in the web page, so the snippet above is not type-checked.

## Comparison with Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `const { ipcRenderer } = require('electron')` | Use `ipcRenderer` directly | It is a name directly available in the preload script |
| `ipcRenderer.send` / `invoke` / `on` / `once` / `off` / `removeAllListeners` | The same | Arguments are passed as JSON; a listener's `event` only has `sender` |

## Corresponding iOS API

`window.webkit.messageHandlers.<name>.postMessage()`, provided in the page by `WKScriptMessageHandlerWithReply`. `ipcRenderer` is built on top of it.

## See also

- [`contextBridge`](context-bridge.md): attaching the preload script's methods to the page
- [Preload scripts](web-view.md#preload-scripts)
- [`WebContents`](web-contents.md): the app's end
