---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `ipcRenderer.invoke()` method

The **`invoke()`** method asks the app for a result from the web page. The app answers with a handler registered with [`webContents.ipc.handle()`](../web-contents-ipc/handle.md), and the handler's return value is what the Promise fulfills with.

Only available in a [preload script](../web-view.md#preload-scripts).

## Syntax

```
ipcRenderer.invoke(channel, ...args)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`args`**

Any number of arguments, passed as JSON; see [How values are passed](../web-contents.md#how-values-are-passed). The handler receives them after `event`.

### Return value

A `Promise`.

| Situation | Result |
| --- | --- |
| The handler returned a value, or the Promise it returned fulfilled | Fulfills with that value, passed over as JSON |
| The handler returned `undefined` | Fulfills with `undefined` |
| The handler threw, or the Promise it returned was rejected | Rejects, with the message `Error invoking remote method 'get-user': Error: …` |
| The app registered no handler for this channel | Rejects, with the message `Error invoking remote method 'get-user': Error: No handler registered for 'get-user'` |
| The page is destroyed while waiting for the result | Rejects |

The handler can be asynchronous; the Promise waits until it returns.

### Exceptions

**`TypeError`**

An argument is a function: `ipcRenderer.invoke: functions cannot be sent`. Thrown in the page on the spot, without returning a Promise.

## Examples

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  getUser: () => ipcRenderer.invoke('get-user'),
});
```

On the app side:

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.ipc.handle('get-user', () => ({ name: 'Alice' }));
```

**Effect**: In the page, `await app.getUser()` gives `{ name: 'Alice' }`.

## Differences from Electron

The same as Electron's `ipcRenderer.invoke(channel, ...args)`, including the format of the rejection message. Arguments and results are passed as JSON.

The corresponding native iOS mechanism is `WKScriptMessageHandlerWithReply`: in the page, `postMessage()` returns a Promise.

## See also

- [`WebContentsIPC.handle()`](../web-contents-ipc/handle.md)
- [Letting the page ask the app for a result](../../guides/web-page-messaging.md#having-the-page-ask-the-app-for-a-result)
