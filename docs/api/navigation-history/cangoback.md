---
type: reference
native: WKWebView.canGoBack
---

# `NavigationHistory`：`canGoBack()` 方法

**`canGoBack()`** 方法返回网页现在能不能后退。

## 语法

```
canGoBack()
```

### 参数

无。

### 返回值

布尔。

- `true`：能后退，调 [`goBack()`](goback.md) 会后退一页。
- `false`：不能后退，调 `goBack()` 什么都不发生。

没有变化通知。它在每次 [`did-navigate`](../web-contents/did-navigate-event.md) 之后可能变化，在那个事件里重新读。

### 异常

**`TypeError`**

网页已经销毁：`Object has been destroyed`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', () => {
  console.log(contents.navigationHistory.canGoBack());
});
```

**效果**：每次网页换了文档，输出现在能不能后退。

## 和 Electron 的差别

和 Electron 的 `navigationHistory.canGoBack()` 相同。对应的 iOS 原生成员是 `WKWebView.canGoBack`。

## 参见

- [`goBack()`](goback.md)
