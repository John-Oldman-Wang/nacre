---
type: reference
native: WebContentsIpcMessageEvent.channel
---

# `WebContentsIpcMessageEvent`: `channel` property

The **`channel`** property is the channel name: the first argument the page gave to `ipcRenderer.send()`.

## Value

A string. The web page decides it, so it is untrusted input.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('ipc-message', (e) => {
  if (e.channel === 'close') console.log('网页要求关闭');
});
```

**Effect**: when the page calls `ipcRenderer.send('close')`, prints `网页要求关闭`.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsIpcMessageEvent`](../web-contents-ipc-message-event.md)
