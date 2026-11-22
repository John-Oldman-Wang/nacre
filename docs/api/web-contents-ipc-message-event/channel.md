---
type: reference
native: WebContentsIpcMessageEvent.channel
---

# `WebContentsIpcMessageEvent`：`channel` 属性

**`channel`** 属性是频道名：网页调 `ipcRenderer.send()` 时给的第一个参数。

## 值

字符串。由网页决定，属于不可信的输入。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('ipc-message', (e) => {
  if (e.channel === 'close') console.log('网页要求关闭');
});
```

**效果**：网页调 `ipcRenderer.send('close')` 时，输出 `网页要求关闭`。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsIpcMessageEvent`](../web-contents-ipc-message-event.md)
