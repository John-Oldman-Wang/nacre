---
type: reference
native: WKWebView
---

# `WebView`：`webContents` 属性

**`webContents`** 属性是视图里的那张网页。加载地址、后退前进、监听加载过程、在网页里执行脚本、和网页互发消息，都在它上面。

## 值

[`WebContents`](../web-contents.md)。

- 只读。给它赋值抛 `TypeError`。
- 随 `WebView` 一起创建，每次读是同一个对象。
- 网页被 [`close()`](../web-contents/close.md) 销毁之后，读到的还是这个对象，它的 [`isDestroyed()`](../web-contents/isdestroyed.md) 返回 `true`。

## 示例

```js
const web = new WebView();
const contents = web.webContents;
console.log(contents === web.webContents, contents.getURL() === '');
```

**结果**：输出 `true true`。还没加载过的网页，地址是空串。

## 和 Electron 的差别

和 Electron 的 `view.webContents` 相同。

## 参见

- [`WebContents`](../web-contents.md)
