---
type: reference
native: "-[WKWebView evaluateJavaScript:completionHandler:]"
---

# `WebContents`: `send()` method

The **`send()`** method sends a message to the web page's preload script. The preload script receives it with [`ipcRenderer.on()`](../ipc-renderer/on.md).

## Syntax

```
send(channel, ...args)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`args`**

Any number of arguments, passed as JSON; see [How values are passed](../web-contents.md#how-values-are-passed).

### Return value

None (`undefined`). The app isn't told whether the page received it.

### Exceptions

**`TypeError`**

- The arguments contain a function: `send: functions cannot be sent`. With a symbol in the arguments it is `send: symbols cannot be sent`.
- The page has been destroyed: `Object has been destroyed`.

## Description

When the page hasn't loaded yet, has no preload script, or the preload script isn't listening on this channel, nobody receives the message; it is dropped without an error. So send it after [`did-finish-load`](did-finish-load-event.md).

## Examples

On the app side:

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.addEventListener('did-finish-load', () => {
  web.webContents.send('theme', 'dark');
});
web.webContents.loadURL('https://my.app/');
```

In the preload script `JS/web/preload.js`:

```javascript
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

**Effect**: After the page finishes loading, `<html>` gets `data-theme="dark"`.

## Differences from Electron

Same as Electron's `contents.send(channel, ...args)`. Arguments are passed as JSON, not with Electron's structured clone, and a function in the arguments throws immediately.

The native iOS equivalent is calling a function in the page with `evaluateJavaScript:`, which the runtime does for you.

## See also

- [`ipcRenderer.on()`](../ipc-renderer/on.md): how the preload script side receives it
- [The app notifying the page](../../guides/web-page-messaging.md#having-the-app-notify-the-page)
