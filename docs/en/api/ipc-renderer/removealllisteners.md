---
type: reference
native: WKUserScript
---

# `ipcRenderer.removeAllListeners()` method

The **`removeAllListeners()`** method removes all listeners on a channel; without a channel, it removes those of all channels.

Only available in a [preload script](../web-view.md#preload-scripts).

## Syntax

```
ipcRenderer.removeAllListeners([channel])
```

### Parameters

**`channel`** <small>optional</small>

The channel name, a string. Non-strings are converted with `String()`. When omitted (or `undefined`), the listeners of all channels are removed.

### Return value

`ipcRenderer` itself.

### Exceptions

None.

## Examples

```javascript
// JS/web/preload.js
ipcRenderer.on('to-page', (event, value) => console.log(value));
contextBridge.exposeInMainWorld('app', {
  mute: () => ipcRenderer.removeAllListeners('to-page'),
});
```

**Effect**: After the page calls `app.mute()`, when the app sends another `to-page` message, the page no longer receives it.

## Differences from Electron

The same as Electron's `ipcRenderer.removeAllListeners([channel])`.

## See also

- [`off()`](off.md)
