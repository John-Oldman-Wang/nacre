---
type: reference
native: "webView:didFinishNavigation:"
---

# `WebContents`：`did-finish-load` 事件

**`did-finish-load`** 事件在网页加载完时派发。

## 语法

```
contents.addEventListener('did-finish-load', (event) => {})
```

## 事件对象

`Event`，没有附加的字段。不可取消。

## 什么时候派发

成功的加载里最后一个派发，在 `did-stop-loading` 之后。服务器返回 404、500 的错误页照常加载完，也派发。

网页的标题和「加载完」谁先到不固定。要标题就监听 [`page-title-updated`](page-title-updated-event.md)，不要在这里读 `getTitle()`。

## 示例

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.addEventListener('did-finish-load', () => {
  web.webContents.send('theme', 'dark');
});
web.webContents.loadURL('https://my.app/');
```

**效果**：网页加载完之后，App 给预加载脚本发一条 `theme` 消息。早于这个时刻发的消息可能没人收。

## 和 Electron 的差别

和 Electron 的 `did-finish-load` 相同。对应的 iOS 原生写法是 `webView:didFinishNavigation:`。

## 参见

- [`loadURL()`](loadurl.md)：它返回的 Promise 也在加载完时兑现
