---
type: reference
native: WebContentsWillNavigateEvent.isMainFrame
---

# `WebContentsWillNavigateEvent`：`isMainFrame` 属性

**`isMainFrame`** 属性总是 `true`：`<iframe>` 里的跳转不派发这个事件。

## 值

布尔值。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `true`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  console.log(e.isMainFrame);
});
```

**效果**：网页每次自己发起跳转，输出 `true`。

## 对应的 iOS API

`navigationAction.targetFrame.isMainFrame`。

## 参见

- [`WebContentsWillNavigateEvent`](../web-contents-will-navigate-event.md)
