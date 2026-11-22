---
type: reference
native: WebContentsWillNavigateEvent.url
---

# `WebContentsWillNavigateEvent`：`url` 属性

**`url`** 属性是要去的地址。

## 值

字符串。是网页给的，属于不可信的输入，按它做事之前先检查。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  if (!e.url.startsWith('https://example.com/')) {
    e.preventDefault();
  }
});
```

**效果**：网页只能跳到 `https://example.com/` 下的地址，别的跳转被拦下，网页留在原地。

## 对应的 iOS API

`webView:decidePolicyForNavigationAction:decisionHandler:` 里 `navigationAction.request.URL`。

## 参见

- [`WebContentsWillNavigateEvent`](../web-contents-will-navigate-event.md)
