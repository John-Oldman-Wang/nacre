---
type: reference
native: WKUserScript
---

# `ipcRenderer.removeListener()` method

The **`removeListener()`** method is the same as [`off()`](off.md): it removes one listener registered on a channel.

Only available in a [preload script](../web-view.md#preload-scripts).

## Syntax

```
ipcRenderer.removeListener(channel, listener)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`listener`**

The listener to remove; it must be the same function passed when registering.

### Return value

`ipcRenderer` itself.

### Exceptions

None. No error if it was never registered.

## Examples

```javascript
// JS/web/preload.js
const onTheme = (event, name) => console.log(name);
ipcRenderer.on('theme', onTheme);
ipcRenderer.removeListener('theme', onTheme);
```

**Effect**: When the app sends another `theme` message, `onTheme` is no longer called. **Not verified in the simulator.**

## Differences from Electron

The same as Electron's `ipcRenderer.removeListener(channel, listener)`.

## See also

- [`off()`](off.md)
