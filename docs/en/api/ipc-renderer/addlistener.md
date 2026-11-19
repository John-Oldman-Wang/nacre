---
type: reference
native: WKUserScript
---

# `ipcRenderer.addListener()` method

The **`addListener()`** method is the same as [`on()`](on.md): on the page side, it receives messages the app sends on a channel.

Only available in a [preload script](../web-view.md#preload-scripts).

## Syntax

```
ipcRenderer.addListener(channel, listener)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`listener`**

The listener, of the form `(event, ...args) => {}`, the same as for `on()`.

### Return value

`ipcRenderer` itself.

### Exceptions

**`TypeError`**

`listener` is not a function: `The listener must be a function`.

## Examples

```javascript
// JS/web/preload.js
ipcRenderer.addListener('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

**Effect**: The same as registering with `on()`. **Not verified in the simulator.**

## Differences from Electron

The same as Electron's `ipcRenderer.addListener(channel, listener)`.

## See also

- [`on()`](on.md)
