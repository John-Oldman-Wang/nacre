---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `ipcRenderer.invoke()` 方法

**`invoke()`** 方法从网页向 App 要一个结果。App 用 [`webContents.ipc.handle()`](../web-contents-ipc/handle.md) 登记的处理函数应答，处理函数的返回值就是 Promise 兑现的值。

只在[预加载脚本](../web-view.md#预加载脚本)里能用。

## 语法

```
ipcRenderer.invoke(channel, ...args)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`args`**

任意个参数，按 JSON 传，见[值怎么传](../web-contents.md#值怎么传)。处理函数在 `event` 之后拿到它们。

### 返回值

`Promise`。

| 情况 | 结果 |
| --- | --- |
| 处理函数返回了一个值，或者返回的 Promise 兑现了 | 兑现成这个值，按 JSON 传过来 |
| 处理函数返回 `undefined` | 兑现成 `undefined` |
| 处理函数抛了异常，或者返回的 Promise 被拒绝 | 拒绝，说明是 `Error invoking remote method 'get-user': Error: …` |
| App 没有给这个频道登记处理函数 | 拒绝，说明是 `Error invoking remote method 'get-user': Error: No handler registered for 'get-user'` |
| 等结果时网页被销毁 | 拒绝 |

处理函数可以是异步的，Promise 一直等到它返回。

### 异常

**`TypeError`**

参数里有函数：`ipcRenderer.invoke: functions cannot be sent`。在网页里当场抛，不返回 Promise。

## 示例

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  getUser: () => ipcRenderer.invoke('get-user'),
});
```

App 这边：

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.ipc.handle('get-user', () => ({ name: 'Alice' }));
```

**效果**：网页里 `await app.getUser()` 得到 `{ name: 'Alice' }`。

## 和 Electron 的差别

和 Electron 的 `ipcRenderer.invoke(channel, ...args)` 相同，拒绝时的说明格式也相同。参数和结果按 JSON 传。

对应的 iOS 原生写法是 `WKScriptMessageHandlerWithReply`：网页里 `postMessage()` 返回 Promise。

## 参见

- [`WebContentsIPC.handle()`](../web-contents-ipc/handle.md)
- [让网页向 App 要一个结果](../../guides/web-page-messaging.md#让网页向-app-要一个结果)
