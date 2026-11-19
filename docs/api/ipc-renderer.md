---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `ipcRenderer`

**`ipcRenderer`** 表示消息通道在网页那一头：网页给 App 发消息、向 App 要结果、收 App 发来的消息，都用它。

它只在[预加载脚本](web-view.md#预加载脚本)里能用。预加载脚本是建 `WebView` 时用 `webPreferences.preload` 指定的一个 JS 文件，在网页里执行。`ipcRenderer` 是预加载脚本里直接能用的一个名字，不是网页的全局：网页自己的脚本里 `typeof ipcRenderer` 是 `'undefined'`。App 的 `main.js` 里也没有它。

预加载脚本通常用 [`contextBridge.exposeInMainWorld()`](context-bridge/exposeinmainworld.md) 把几个具体的方法挂到网页的 `window` 上，方法里再调 `ipcRenderer`。

App 那一头对应的是 [`webContents`](web-contents.md)：`send()` 发来的消息在 [`ipc-message`](web-contents/ipc-message-event.md) 事件里收，`invoke()` 发来的请求由 [`webContents.ipc.handle()`](web-contents-ipc/handle.md) 应答，App 用 [`webContents.send()`](web-contents/send.md) 发的消息由 `on()` 收。

怎么搭起这条通道，见指南[让网页和 App 互发消息](../guides/web-page-messaging.md)。

> **注意**：预加载脚本和网页的脚本不隔离。网页里的任何脚本都可以不经过 `ipcRenderer`，直接往消息通道里发消息，也可以冒充 App，让 `on()` 登记的监听器收到假的消息。见[预加载脚本](web-view.md#预加载脚本)。

## 函数

`ipcRenderer` 是一个对象，下面是它的方法。

给 App 发消息：

| 方法 | 说明 |
| --- | --- |
| [`send()`](ipc-renderer/send.md) | 给 App 发一条消息，不等回复 |
| [`invoke()`](ipc-renderer/invoke.md) | 向 App 要一个结果，返回 Promise |

收 App 发来的消息：

| 方法 | 说明 |
| --- | --- |
| [`on()`](ipc-renderer/on.md) | 收一个频道的消息 |
| [`addListener()`](ipc-renderer/addlistener.md) | 和 `on()` 相同 |
| [`once()`](ipc-renderer/once.md) | 收一个频道的消息，只收一次 |
| [`off()`](ipc-renderer/off.md) | 不再收 |
| [`removeListener()`](ipc-renderer/removelistener.md) | 和 `off()` 相同 |
| [`removeAllListeners()`](ipc-renderer/removealllisteners.md) | 去掉一个频道（或全部频道）的监听 |

消息的参数和结果都按 JSON 传，见[值怎么传](web-contents.md#值怎么传)。

## 示例

预加载脚本 `JS/web/preload.js`：

```javascript
contextBridge.exposeInMainWorld('app', {
  share: (id) => ipcRenderer.send('share', id),
  getUser: () => ipcRenderer.invoke('get-user'),
});
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

App 这边：

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
const contents = web.webContents;
contents.addEventListener('ipc-message', (e) => {
  if (e.channel === 'share') console.log('网页要分享', e.args[0]);
});
contents.ipc.handle('get-user', () => ({ name: 'Jack' }));
contents.addEventListener('did-finish-load', () => contents.send('theme', 'dark'));
```

**效果**

- 网页调 `app.share(42)` 时，App 的控制台输出 `网页要分享 42`。
- 网页里 `await app.getUser()` 得到 `{ name: 'Jack' }`。
- 网页加载完后，`<html>` 上多了 `data-theme="dark"`。

预加载脚本的代码在网页里执行，现在没有类型定义，上面那段不参与类型检查。

## 与 Electron 的对照

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `const { ipcRenderer } = require('electron')` | 直接用 `ipcRenderer` | 是预加载脚本里直接能用的名字 |
| `ipcRenderer.send` / `invoke` / `on` / `once` / `off` / `removeAllListeners` | 相同 | 参数按 JSON 传；监听器的 `event` 上只有 `sender` |
| `ipcRenderer.sendSync` | 没有 | 见还不能做的 |

## 对应的 iOS API

`WKScriptMessageHandlerWithReply` 在网页里提供的 `window.webkit.messageHandlers.<名字>.postMessage()`。`ipcRenderer` 建在它上面。

## 还不能做的

| 想做的事 | 对应的能力 |
| --- | --- |
| 网页同步地向 App 要一个结果 | Electron 的 `ipcRenderer.sendSync` |
| 在 `<iframe>` 里用 | Electron 的 `nodeIntegrationInSubFrames`；`WKUserScript` 的 `forMainFrameOnly` |
| 类型定义 | |

## 参见

- [`contextBridge`](context-bridge.md)：把预加载脚本的方法挂到网页上
- [预加载脚本](web-view.md#预加载脚本)
- [`WebContents`](web-contents.md)：App 那一头
