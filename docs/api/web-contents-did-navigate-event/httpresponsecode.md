---
type: reference
native: WebContentsDidNavigateEvent.httpResponseCode
---

# `WebContentsDidNavigateEvent`：`httpResponseCode` 属性

**`httpResponseCode`** 属性是 HTTP 状态码。

## 值

数。

- 只读。给它赋值抛 `TypeError`。
- 服务器返回 404、500 时照常派发，状态码在这里。
- `data:`、`about:`、本地文件这类不经过 HTTP 的是 `-1`。
- 后退或前进回到一张之前加载过的网页时也是 `-1`：那时没有重新请求服务器。
- 用 [`new`](constructor.md) 创建时没给，是 `-1`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', (e) => {
  if (e.httpResponseCode >= 400) console.log('服务器返回了', e.httpResponseCode);
});
contents.loadURL('https://example.com/no-such-page');
```

**效果**：输出 `服务器返回了 404`。

## 对应的 iOS API

`webView:decidePolicyForNavigationResponse:decisionHandler:` 里 `navigationResponse.response` 的 `statusCode`。

## 参见

- [`WebContentsDidNavigateEvent`](../web-contents-did-navigate-event.md)
