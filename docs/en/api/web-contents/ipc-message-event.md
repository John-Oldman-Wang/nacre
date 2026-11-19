---
type: reference
native: WKScriptMessageHandler
---

# `WebContents`: `ipc-message` event

The **`ipc-message`** event fires when the web page's preload script calls [`ipcRenderer.send()`](../ipc-renderer/send.md).

## Syntax

```
contents.addEventListener('ipc-message', (event) => {})
```

## Event object

`WebContentsIpcMessageEvent`. Besides `type` and `target`, it has two fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `channel` | string | The channel name |
| `args` | array | The arguments that followed the channel name, passed as JSON |

`target` is this page's `webContents`. Not cancelable.

## When it fires

After the page calls `ipcRenderer.send(channel, ...args)`. Only pages whose `WebView` was created with a [preload script](../web-view.md#preload-scripts) have a message channel. Messages sent from inside an `<iframe>` aren't received.

> **Note:** Any script in the page (including third-party scripts it loads) can send these messages, and it decides both the channel name and the arguments. Check everything received as untrusted input.

## Examples

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
const contents = web.webContents;
contents.addEventListener('ipc-message', (e) => {
  if (!contents.getURL().startsWith('https://my.app/')) return;
  if (e.channel === 'share') {
    const id = e.args[0];
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return;
    console.log('Share', id);
  }
});
```

**Effect**

- When the page is under `https://my.app/` and sends `share` with a positive integer, it prints `Share` and that number.
- When the page has navigated to another site, or the argument isn't a positive integer, the message is ignored.

## Differences from Electron

Electron writes `contents.on('ipc-message', (event, channel, ...args) => …)`; here it is `e.channel` and `e.args`. Arguments are passed as JSON.

The native iOS equivalent is a message received by `WKScriptMessageHandler`.

## See also

- [`ipcRenderer.send()`](../ipc-renderer/send.md)
- [Messaging between web pages and the app](../../guides/web-page-messaging.md#the-first-message)
