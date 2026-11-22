---
type: reference
native: WebContentsPageTitleUpdatedEvent.title
---

# `WebContentsPageTitleUpdatedEvent`：`title` 属性

**`title`** 属性是新的标题。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 换页的瞬间会先变成空串；新页面的标题到了再派发一次。拿它当导航条的标题时，跳过空串。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const page = new UIViewController();
const contents = new WebView().webContents;
contents.addEventListener('page-title-updated', (e) => {
  if (e.title !== '') page.title = e.title;
});
```

**效果**：网页的标题出来后，页面的标题跟着变。

## 对应的 iOS API

`WKWebView` 的 `title`，用键值观察得知它变了。

## 参见

- [`WebContentsPageTitleUpdatedEvent`](../web-contents-page-title-updated-event.md)
