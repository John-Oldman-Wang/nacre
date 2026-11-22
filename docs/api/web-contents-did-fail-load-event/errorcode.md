---
type: reference
native: WebContentsDidFailLoadEvent.errorCode
---

# `WebContentsDidFailLoadEvent`：`errorCode` 属性

**`errorCode`** 属性是系统的错误码。

## 值

数。常见的：

- 只读。给它赋值抛 `TypeError`。
- `-1003`：域名解析不了。
- `-1009`：没有网络。
- `-1001`：超时。
- `-999`：被取消（被 `stop()` 停掉，或者被另一次加载取代）。
- 其余的见 [`did-fail-load`](../web-contents/did-fail-load-event.md)。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  if (e.errorCode === -1009) console.log('没有网络');
});
contents.loadURL('https://example.com').catch(() => {});
```

**效果**：没有网络时加载，输出 `没有网络`。

## 对应的 iOS API

`webView:didFailNavigation:withError:` 和 `webView:didFailProvisionalNavigation:withError:` 里 `error.code`。

## 参见

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
