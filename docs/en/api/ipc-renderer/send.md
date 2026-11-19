---
type: reference
native: WKScriptMessageHandler
---

# `ipcRenderer.send()` method

The **`send()`** method sends a message from the web page to the app without waiting for a reply. The app receives it in the [`ipc-message`](../web-contents/ipc-message-event.md) event of `webContents`.

Only available in a [preload script](../web-view.md#preload-scripts).

## Syntax

```
ipcRenderer.send(channel, ...args)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`args`**

Any number of arguments, passed as JSON; see [How values are passed](../web-contents.md#how-values-are-passed). The app receives them as the event's `args` array.

### Return value

None (`undefined`). The page is not told whether the app received it.

### Exceptions

**`TypeError`**

An argument is a function: `ipcRenderer.send: functions cannot be sent`. With a symbol: `ipcRenderer.send: symbols cannot be sent`. Thrown in the page on the spot.

## Description

The app does not accept messages sent from an `<iframe>`.

## Examples

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  say: (text) => ipcRenderer.send('say', text, { at: 1 }),
});
```

**Effect**: When the page calls `app.say('hi')`, the app receives one `ipc-message`, with `e.channel` set to `'say'` and `e.args` set to `['hi', { at: 1 }]`.

## Differences from Electron

The same as Electron's `ipcRenderer.send(channel, ...args)`. Arguments are passed as JSON, not with structured cloning, and including a function throws on the spot.

## See also

- [`ipc-message`](../web-contents/ipc-message-event.md): how the app's end receives
- [`invoke()`](invoke.md): use it when you need to wait for the app to reply with a result
