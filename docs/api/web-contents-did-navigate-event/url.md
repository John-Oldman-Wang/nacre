---
type: reference
native: WebContentsDidNavigateEvent.url
---

# `WebContentsDidNavigateEvent`：`url` 属性

**`url`** 属性是新的地址。

## 值

字符串。服务器重定向过的，是重定向之后的地址。**未在模拟器验证。**

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', (e) => {
  console.log('现在在', e.url);
});
contents.loadURL('https://example.com');
```

**效果**：网页加载出来后，输出 `现在在 https://example.com/`。**未在模拟器验证。**

## 对应的 iOS API

`webView.URL`，在 `webView:didCommitNavigation:` 的时候读。

## 参见

- [`WebContentsDidNavigateEvent`](../web-contents-did-navigate-event.md)
