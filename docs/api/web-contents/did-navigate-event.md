---
type: reference
native: "webView:didCommitNavigation:"
---

# `WebContents`：`did-navigate` 事件

**`did-navigate`** 事件在网页换成了一个新的文档时派发。这时新地址已经确定，服务器的状态码已经拿到。

## 语法

```
contents.addEventListener('did-navigate', (event) => {})
```

## 事件对象

`WebContentsDidNavigateEvent`，除 `type`、`target` 以外带两个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `url` | 字符串 | 新的地址 |
| `httpResponseCode` | 数 | HTTP 状态码。`data:`、`about:`、本地文件这类不经过 HTTP 的是 `-1`。后退或前进回到一张之前加载过的网页时也是 `-1`：那时没有重新请求服务器 |

不可取消。

## 什么时候派发

成功的加载里排在 `did-start-loading` 之后、`did-stop-loading` 之前。服务器返回 404、500 时照常派发，状态码在 `httpResponseCode` 上。加载失败（网络层的错误）时不派发。

能不能后退、前进在每次 `did-navigate` 之后可能变化，在这个事件里重新读 [`navigationHistory`](navigationhistory.md)。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', (e) => {
  if (e.httpResponseCode >= 400) console.log('服务器返回了', e.httpResponseCode);
});
contents.loadURL('https://example.com/no-such-page');
```

**效果**：服务器返回 404 时输出 `服务器返回了 404`。

## 和 Electron 的差别

Electron 写成 `contents.on('did-navigate', (event, url, httpResponseCode, httpStatusText) => …)`，这里数据在事件对象上。没有 `httpStatusText`：系统不提供。

对应的 iOS 原生写法是 `webView:didCommitNavigation:`。

## 参见

- [`getURL()`](geturl.md)
- [处理加载失败](../../guides/web-pages.md#处理加载失败)
