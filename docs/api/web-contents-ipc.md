---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `WebContentsIPC`

**`WebContentsIPC`** 表示一张网页的请求-应答通道在 App 这一头。网页的预加载脚本用 [`ipcRenderer.invoke()`](ipc-renderer/invoke.md) 发来请求，App 用这个对象登记的处理函数应答，处理函数的返回值就是网页那边拿到的结果。

它从 [`webContents.ipc`](web-contents/ipc.md) 得到，一张网页只有一个。网页用 `ipcRenderer.send()` 发来的单向消息不经过它，在 [`ipc-message`](web-contents/ipc-message-event.md) 事件里收。

**继承关系**：`WebContentsIPC`（不继承 `EventTarget`，没有事件）

怎么让网页向 App 要结果，见指南[让网页和 App 互发消息](../guides/web-page-messaging.md#让网页向-app-要一个结果)。

## 构造函数

不能用 `new` 创建：抛 `TypeError: Illegal constructor: this object is created by the runtime, not by new`。从 [`webContents.ipc`](web-contents/ipc.md) 得到。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`handle()`](web-contents-ipc/handle.md) | 登记一个频道的处理函数 |
| [`removeHandler()`](web-contents-ipc/removehandler.md) | 去掉一个频道的处理函数 |

一个频道只能登记一个处理函数。网页销毁时还没答复的请求，网页那边全部被拒绝。

## 示例

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.ipc.handle('get-user', async (event) => {
  if (!event.sender.getURL().startsWith('https://my.app/')) throw new Error('not allowed');
  return { name: application.storage.get('name') };
});
```

**效果**：网页在 `https://my.app/` 下面时，预加载脚本里 `await ipcRenderer.invoke('get-user')` 得到 `{ name: … }`。在别的站点时，网页那边被拒绝，说明是 `Error invoking remote method 'get-user': Error: not allowed`。

## 与 Electron 的对照

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `contents.ipc.handle(channel, listener)` | 相同 | 处理函数的 `event` 上只有 `sender` |
| `contents.ipc.removeHandler(channel)` | 相同 | |
| `contents.ipc.on(channel, listener)` | 没有 | 单向消息用 `ipc-message` 事件 |

## 对应的 iOS API

`WKScriptMessageHandlerWithReply`：网页那边 `postMessage` 得到 Promise，App 这边用 `replyHandler` 答复。

## 参见

- [`ipcRenderer.invoke()`](ipc-renderer/invoke.md)：网页那一头怎么发请求
- [`WebContents`](web-contents.md)
