---
type: reference
native: WKUserScript
---

# `ipcRenderer.on()` method

The **`on()`** method, on the page side, receives messages the app sends on a channel with [`webContents.send()`](../web-contents/send.md).

Only available in a [preload script](../web-view.md#preload-scripts).

## Syntax

```
ipcRenderer.on(channel, listener)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`listener`**

The listener, of the form `(event, ...args) => {}`. `event.sender` is `ipcRenderer` itself; `args` are the arguments after the channel name in the app's `send(channel, ...args)`.

A channel can have several listeners, called in the order they were registered. If one listener throws, the error is printed to the page's console, and the rest are called as usual.

### Return value

`ipcRenderer` itself, so calls can be chained.

### Exceptions

**`TypeError`**

`listener` is not a function: `The listener must be a function`.

## Description

Scripts in the page can also put messages into the channel and impersonate the app. Messages received here cannot be assumed to come from the app.

## Examples

```javascript
// JS/web/preload.js
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

**Effect**: After the app calls `contents.send('theme', 'dark')`, the page's `<html>` gains `data-theme="dark"`.

## Differences from Electron

The same as Electron's `ipcRenderer.on(channel, listener)`. `event` only has `sender`.

## See also

- [`webContents.send()`](../web-contents/send.md): how the app's end sends
- [`once()`](once.md), [`off()`](off.md)
