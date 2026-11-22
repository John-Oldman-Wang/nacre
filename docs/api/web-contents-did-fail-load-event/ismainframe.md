---
type: reference
native: WebContentsDidFailLoadEvent.isMainFrame
---

# `WebContentsDidFailLoadEvent`：`isMainFrame` 属性

**`isMainFrame`** 属性总是 `true`：网页里 `<iframe>` 的加载失败不派发这个事件。

## 值

布尔值。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `true`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log(e.isMainFrame);
});
```

**效果**：加载失败时输出 `true`。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
