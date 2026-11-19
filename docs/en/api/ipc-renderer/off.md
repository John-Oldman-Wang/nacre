---
type: reference
native: WKUserScript
---

# `ipcRenderer.off()` method

The **`off()`** method removes one listener registered with [`on()`](on.md) or [`once()`](once.md). That listener no longer receives messages afterward.

Only available in a [preload script](../web-view.md#preload-scripts).

## Syntax

```
ipcRenderer.off(channel, listener)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`listener`**

The listener to remove; it must be the same function passed when registering. If the same function was registered several times, only one registration is removed.

### Return value

`ipcRenderer` itself.

### Exceptions

None. No error if the channel or listener was never registered.

## Examples

```javascript
// JS/web/preload.js
const onTheme = (event, name) => {
  document.documentElement.dataset.theme = name;
};
ipcRenderer.on('theme', onTheme);
ipcRenderer.off('theme', onTheme);
```

**Effect**: When the app sends another `theme` message, the page no longer receives it.

## Differences from Electron

The same as Electron's `ipcRenderer.off(channel, listener)`.

## See also

- [`removeListener()`](removelistener.md): another name for the same method
- [`removeAllListeners()`](removealllisteners.md)
