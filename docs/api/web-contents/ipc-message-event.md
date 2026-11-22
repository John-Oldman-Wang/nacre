---
type: reference
native: WKScriptMessageHandler
---

# `WebContents`：`ipc-message` 事件

**`ipc-message`** 事件在网页的预加载脚本调了 [`ipcRenderer.send()`](../ipc-renderer/send.md) 时派发。

## 语法

```
contents.addEventListener('ipc-message', (event) => {})
```

## 事件对象

[`WebContentsIpcMessageEvent`](../web-contents-ipc-message-event.md)，除 `type`、`target` 以外带两个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`channel`](../web-contents-ipc-message-event/channel.md) | 字符串 | 频道名 |
| [`args`](../web-contents-ipc-message-event/args.md) | 数组 | 跟在频道名后面的那些参数，按 JSON 传过来的 |

`target` 是这张网页的 `webContents`。不可取消。

## 什么时候派发

网页里调 `ipcRenderer.send(channel, ...args)` 之后。只有建 `WebView` 时配了[预加载脚本](../web-view.md#预加载脚本)的网页才有消息通道。`<iframe>` 里发来的消息不接收。

> **注意**：网页里的任何脚本（包括它引入的第三方脚本）都能发这种消息，频道名和参数都由它决定。收到的内容一律当成不可信的输入来检查。

## 示例

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
const contents = web.webContents;
contents.addEventListener('ipc-message', (e) => {
  if (!contents.getURL().startsWith('https://my.app/')) return;
  if (e.channel === 'share') {
    const id = e.args[0];
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return;
    console.log('分享', id);
  }
});
```

**效果**

- 网页在 `https://my.app/` 下面，并且发来 `share` 和一个正整数时，输出 `分享` 和这个数。
- 网页跳到了别的站点，或者参数不是正整数时，这条消息被忽略。

## 和 Electron 的差别

Electron 写成 `contents.on('ipc-message', (event, channel, ...args) => …)`，这里是 `e.channel`、`e.args`。参数按 JSON 传。

对应的 iOS 原生写法是 `WKScriptMessageHandler` 收到的消息。

## 参见

- [`ipcRenderer.send()`](../ipc-renderer/send.md)
- [让网页和 App 互发消息](../../guides/web-page-messaging.md#第一条消息)
