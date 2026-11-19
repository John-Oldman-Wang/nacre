---
type: reference
native: WKUserScript
---

# `ipcRenderer.once()` method

The **`once()`** method, on the page side, receives messages the app sends on a channel, only once. The listener is removed automatically after the first message.

Only available in a [preload script](../web-view.md#preload-scripts).

## Syntax

```
ipcRenderer.once(channel, listener)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

**`listener`**

The listener, of the form `(event, ...args) => {}`, the same as for [`on()`](on.md).

### Return value

`ipcRenderer` itself.

### Exceptions

**`TypeError`**

`listener` is not a function: `The listener must be a function`.

## Examples

```javascript
// JS/web/preload.js
ipcRenderer.once('ready', (event, value) => {
  console.log('Received', value);
});
```

**Effect**: When the app calls `contents.send('ready', 'a')` and then `contents.send('ready', 'b')`, the page's console prints only `Received a`.

## Differences from Electron

The same as Electron's `ipcRenderer.once(channel, listener)`.

## See also

- [`on()`](on.md)
