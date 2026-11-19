---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `WebContentsIPC`: `handle()` method

The **`handle()`** method registers a handler for a channel. When the web page's preload script calls [`ipcRenderer.invoke()`](../ipc-renderer/invoke.md) on this channel, the handler is called, and its return value is the result the web page gets.

## Syntax

```
handle(channel, listener)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`listener`**

The handler function, of the form `(event, ...args) => value`.

- `event.sender` is the [`webContents`](../web-contents.md) that sent the request.
- `args` are the arguments after the channel name in the web page's `invoke(channel, ...args)`, passed as JSON.
- The return value, or the value its returned Promise fulfills with, is passed to the web page as JSON. Returning `undefined` gives `undefined` on the web page's side. It can be an async function; the web page waits until it returns.
- If it throws, or its returned Promise is rejected, the web page's Promise is rejected with the message `Error invoking remote method 'get-user': Error: …`, followed by the `String()` of the error on this side.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`listener` isn't a function: `handle: the listener must be a function, got …`.

**`Error`**

The channel is already registered: `Attempted to register a second handler for 'get-user'`. To replace the handler, call [`removeHandler()`](removehandler.md) first.

## Description

- If the web page calls `invoke` on a channel with no registered handler, the web page's side is rejected with the message `Error invoking remote method 'get-user': Error: No handler registered for 'get-user'`.
- Requests come from the web page, so check both the arguments and the address of `event.sender` as untrusted input. Return only data this web page should see.
- When the web page is destroyed, all requests not yet answered are rejected on the web page's side.

## Examples

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.ipc.handle('add', async (event, a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') throw new Error('bad arguments');
  return a + b;
});
```

**Effect**: In the preload script, `await ipcRenderer.invoke('add', 1, 2)` gets `3`; `invoke('add', 'x')` is rejected with the message `Error invoking remote method 'add': Error: bad arguments`.

## Differences from Electron

The same as Electron's `ipcMain.handle` / `contents.ipc.handle`. The handler's `event` has only `sender`; return values are passed as JSON.

The corresponding native iOS approach is the `replyHandler` of `WKScriptMessageHandlerWithReply`.

## See also

- [`removeHandler()`](removehandler.md)
- [`ipcRenderer.invoke()`](../ipc-renderer/invoke.md)
