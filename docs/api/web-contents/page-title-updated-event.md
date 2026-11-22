---
type: reference
native: WKWebView.title
---

# `WebContents`：`page-title-updated` 事件

**`page-title-updated`** 事件在网页的标题变化时派发。

## 语法

```
contents.addEventListener('page-title-updated', (event) => {})
```

## 事件对象

[`WebContentsPageTitleUpdatedEvent`](../web-contents-page-title-updated-event.md)，除 `type`、`target` 以外带一个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`title`](../web-contents-page-title-updated-event/title.md) | 字符串 | 新的标题 |

不可取消。

## 什么时候派发

- 网页的 `<title>` 加载出来时。
- 网页的脚本改了 `document.title` 时。
- 换页的瞬间会先派发一次，`title` 是空串；新页面的标题到了再派发一次。

标题和 `did-finish-load` 谁先到不固定。

## 示例

```js
const page = new UIViewController();
const contents = new WebView().webContents;
contents.addEventListener('page-title-updated', (e) => {
  page.title = e.title;
});
contents.loadURL('https://example.com/');
```

**效果**：页面的标题跟着网页的标题变，最后是 `Example Domain`。

## 和 Electron 的差别

Electron 写成 `contents.on('page-title-updated', (event, title, explicitSet) => …)`，这里标题在 `e.title` 上，没有 `explicitSet`，也不能取消。

对应的 iOS 原生成员是 `WKWebView.title`。

## 参见

- [`getTitle()`](gettitle.md)
