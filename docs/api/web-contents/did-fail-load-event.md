---
type: reference
native: "webView:didFailNavigation:withError:"
---

# `WebContents`：`did-fail-load` 事件

**`did-fail-load`** 事件在网页加载失败时派发。

## 语法

```
contents.addEventListener('did-fail-load', (event) => {})
```

## 事件对象

`WebContentsDidFailLoadEvent`，除 `type`、`target` 以外带四个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `errorCode` | 数 | 系统的错误码，见下 |
| `errorDescription` | 字符串 | 系统给的说明。语言跟随系统，只适合打日志 |
| `validatedURL` | 字符串 | 加载失败的那个地址 |
| `isMainFrame` | 布尔 | 总是 `true`。网页里 `<iframe>` 的加载失败不派发这个事件 |

常见的 `errorCode`：

| 值 | 含义 |
| --- | --- |
| `-1003` | 域名解析不了 |
| `-1009` | 没有网络 |
| `-1001` | 超时 |
| `-1022` | 明文 `http://` 被拦截 |
| `-1002` | 不认识的协议，比如没有拦下来的 `tel:` 链接 |
| `-1100` | 本地文件不存在 |
| `-999` | 被取消（被 `stop()` 停掉，或者被另一次加载取代） |
| `102` | 加载到的内容不能显示，比如压缩包、目录 |

不可取消。

## 什么时候派发

- App 发起的加载失败时，和 `loadURL()` 的 Promise 被拒绝同时发生，两处带的信息相同：`errorCode` 和拒绝的错误的 `cause.code` 是同一个数（实测）。
- 用户点链接引起的加载失败时，也派发。
- 服务器返回 404、500 **不算失败**，不派发。

> **注意**：`loadURL` 之后立刻 `stop()`，Promise 以 `AbortError` 拒绝，但**不派发** `did-fail-load`。要知道一次 `loadURL` 的结果，以它的 Promise 为准。

失败之后网页停在原来那一页，不会变成空白，也不显示错误页。要告诉用户加载失败，得自己显示提示。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log('加载失败', e.errorCode, e.validatedURL);
});
contents.loadURL('https://no-such-host.invalid/');
```

**结果**：输出 `加载失败 -1003 https://no-such-host.invalid/`。

## 和 Electron 的差别

Electron 写成 `contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => …)`，这里数据在事件对象上，字段名相同。错误码是系统的那一套（`-1003` 等），不是 Chromium 的（`-105` 等）。

对应的 iOS 原生写法是 `webView:didFailNavigation:withError:` 和 `webView:didFailProvisionalNavigation:withError:`。

## 参见

- [`loadURL()`](loadurl.md)
- [处理加载失败](../../guides/web-pages.md#处理加载失败)
