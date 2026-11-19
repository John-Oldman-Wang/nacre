---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `WebContents`：`ipc` 属性

**`ipc`** 属性用来应答网页的预加载脚本用 [`ipcRenderer.invoke()`](../ipc-renderer/invoke.md) 发来的请求。

## 值

[`WebContentsIPC`](../web-contents-ipc.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读是同一个对象。
- 只管请求和应答。网页用 `ipcRenderer.send()` 发来的单向消息不经过它，在 [`ipc-message`](ipc-message-event.md) 事件里收。

## 示例

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.ipc.handle('get-version', () => '1.0.0');
```

**效果**：网页的预加载脚本里 `await ipcRenderer.invoke('get-version')` 得到 `'1.0.0'`。

## 和 Electron 的差别

Electron 的 `contents.ipc` 是一个只管这张网页的 `IpcMain`，有 `on`、`handle` 等方法。这里只有请求和应答的那一半：`handle()` 和 `removeHandler()`。单向消息用 `ipc-message` 事件。

## 参见

- [`WebContentsIPC`](../web-contents-ipc.md)
- [让网页向 App 要一个结果](../../guides/web-page-messaging.md#让网页向-app-要一个结果)
