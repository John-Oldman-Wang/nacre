---
type: reference
native: WKWebView.URL
---

# `WebContents`：`getURL()` 方法

**`getURL()`** 方法返回当前网页的地址。

## 语法

```
getURL()
```

### 参数

无。

### 返回值

字符串。还没加载过是空串。

地址变化时派发 [`did-navigate`](did-navigate-event.md)，事件的 `url` 就是新地址。加载失败时地址不变，停在原来那一页。

### 异常

**`TypeError`**

网页已经销毁：`Object has been destroyed`。

## 示例

```js
const contents = new WebView().webContents;
console.log(JSON.stringify(contents.getURL()));
await contents.loadURL('https://example.com/');
console.log(contents.getURL());
```

**结果**：先输出 `""`，加载完输出 `https://example.com/`。

## 和 Electron 的差别

和 Electron 的 `contents.getURL()` 相同。对应的 iOS 原生成员是 `WKWebView.URL`。

## 参见

- [`did-navigate`](did-navigate-event.md)
