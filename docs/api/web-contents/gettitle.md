---
type: reference
native: WKWebView.title
---

# `WebContents`：`getTitle()` 方法

**`getTitle()`** 方法返回当前网页的标题，也就是网页里 `<title>` 的内容。

## 语法

```
getTitle()
```

### 参数

无。

### 返回值

字符串。网页没有标题时是空串。

标题变化时派发 [`page-title-updated`](page-title-updated-event.md)。

> **注意**：不要在 `did-finish-load` 里或者 `loadURL` 兑现之后直接读 `getTitle()`。标题和「加载完」谁先到不固定，这时可能还读到空串。要标题就监听 `page-title-updated`。

### 异常

**`TypeError`**

网页已经销毁：`Object has been destroyed`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('page-title-updated', () => {
  console.log(contents.getTitle());
});
contents.loadURL('https://example.com/');
```

**结果**：先输出一个空行（换页的瞬间标题先变成空串），然后输出 `Example Domain`。

## 和 Electron 的差别

和 Electron 的 `contents.getTitle()` 相同。对应的 iOS 原生成员是 `WKWebView.title`。

## 参见

- [`page-title-updated`](page-title-updated-event.md)
