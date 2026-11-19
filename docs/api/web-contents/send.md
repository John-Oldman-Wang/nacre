---
type: reference
native: "-[WKWebView evaluateJavaScript:completionHandler:]"
---

# `WebContents`：`send()` 方法

**`send()`** 方法给网页的预加载脚本发一条消息。预加载脚本用 [`ipcRenderer.on()`](../ipc-renderer/on.md) 收。

## 语法

```
send(channel, ...args)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`args`**

任意个参数，按 JSON 传，见[值怎么传](../web-contents.md#值怎么传)。

### 返回值

无（`undefined`）。网页收没收到不告诉 App。

### 异常

**`TypeError`**

- 参数里有函数：`send: functions cannot be sent`。参数里有 symbol 时是 `send: symbols cannot be sent`。
- 网页已经销毁：`Object has been destroyed`。

## 说明

网页还没加载、或者没配预加载脚本、或者预加载脚本没有监听这个频道时，消息没人收，直接丢掉，不报错。所以要在 [`did-finish-load`](did-finish-load-event.md) 之后再发。

## 示例

App 这边：

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.addEventListener('did-finish-load', () => {
  web.webContents.send('theme', 'dark');
});
web.webContents.loadURL('https://my.app/');
```

预加载脚本 `JS/web/preload.js` 里：

```javascript
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

**效果**：网页加载完后，`<html>` 上多了 `data-theme="dark"`。

## 和 Electron 的差别

和 Electron 的 `contents.send(channel, ...args)` 相同。参数按 JSON 传，不是 Electron 的结构化克隆，带了函数当场抛。

对应的 iOS 原生写法是用 `evaluateJavaScript:` 调网页里的一个函数，由运行时代做。

## 参见

- [`ipcRenderer.on()`](../ipc-renderer/on.md)：预加载脚本这一头怎么收
- [App 主动通知网页](../../guides/web-page-messaging.md#app-主动通知网页)
