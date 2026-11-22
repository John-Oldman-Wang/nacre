---
type: reference
native: WebContentsIpcMessageEvent.args
---

# `WebContentsIpcMessageEvent`：`args` 属性

**`args`** 属性是跟在频道名后面的那些参数。

## 值

数组。参数是按 JSON 传过来的，函数、`undefined` 这类 JSON 表示不了的值传不过来。

- 只读。给它赋值抛 `TypeError`。
- 内容由网页决定，属于不可信的输入，按它做事之前先检查类型和范围。
- 用 [`new`](constructor.md) 创建时没给，是 空数组。

## 示例

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

**效果**：网页调 `ipcRenderer.send('share', 42)` 时，输出 `分享 42`。别的参数被忽略。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsIpcMessageEvent`](../web-contents-ipc-message-event.md)
