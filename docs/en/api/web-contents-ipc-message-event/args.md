---
type: reference
native: WebContentsIpcMessageEvent.args
---

# `WebContentsIpcMessageEvent`: `args` property

The **`args`** property is the arguments that followed the channel name.

## Value

An array. The arguments come over as JSON, so values JSON can't represent, such as functions and `undefined`, don't make it across.

- Read-only. Assigning to it throws `TypeError`.
- The page decides the content, so it is untrusted input; check types and ranges before acting on it.
- When the event is created with [`new`](constructor.md) without it, it is an empty array.

## Examples

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('ipc-message', (e) => {
  if (e.channel === 'share') {
    const id = e.args[0];
    if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
      console.log('分享', id);
    }
  }
});
```

**Effect**: when the page calls `ipcRenderer.send('share', 42)`, prints `分享 42`. Other arguments are ignored.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsIpcMessageEvent`](../web-contents-ipc-message-event.md)
