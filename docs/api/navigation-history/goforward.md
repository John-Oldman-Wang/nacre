---
type: reference
native: "-[WKWebView goForward]"
---

# `NavigationHistory`：`goForward()` 方法

**`goForward()`** 方法让网页前进一页。

## 语法

```
goForward()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

网页已经销毁：`Object has been destroyed`。

不能前进时调用什么都不发生，不报错。

## 说明

- 前进会派发一轮加载事件。不派发 [`will-navigate`](../web-contents/will-navigate-event.md)。
- 回到一张之前加载过的网页时，[`did-navigate`](../web-contents/did-navigate-event.md) 的 `httpResponseCode` 是 `-1`：那时没有重新请求服务器。

## 示例

```js
const history = new WebView().webContents.navigationHistory;
if (history.canGoForward()) history.goForward();
```

**效果**：能前进时前进一页，不能时什么都不发生。

## 和 Electron 的差别

和 Electron 的 `navigationHistory.goForward()` 相同。对应的 iOS 原生写法是 `[webView goForward]`。

## 参见

- [`canGoForward()`](cangoforward.md)
