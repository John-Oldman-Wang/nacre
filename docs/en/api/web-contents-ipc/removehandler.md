---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `WebContentsIPC`: `removeHandler()` method

The **`removeHandler()`** method removes a channel's handler. After that, a web page calling `invoke` on this channel is treated as if no handler were registered.

## Syntax

```
removeHandler(channel)
```

### Parameters

**`channel`**

The channel name, a string. Non-strings are converted with `String()`.

### Return value

None (`undefined`).

### Exceptions

None. A channel that was never registered doesn't throw either.

## Examples

```js
const ipc = new WebView().webContents.ipc;
ipc.handle('ask', () => 1);
ipc.removeHandler('ask');
ipc.handle('ask', () => 2);
```

**Effect**: Doesn't throw. After removal, a handler can be registered again; `invoke('ask')` on the web page's side gets `2`. Calling `invoke('ask')` between the two registrations is rejected with the message `Error invoking remote method 'ask': Error: No handler registered for 'ask'`.

## Differences from Electron

The same as Electron's `contents.ipc.removeHandler(channel)`.

## See also

- [`handle()`](handle.md)
