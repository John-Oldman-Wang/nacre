---
type: reference
native: "-[WKWebView stopLoading]"
---

# `WebContents`：`stop()` 方法

**`stop()`** 方法停掉正在进行的加载。网页停在原来那一页。

## 语法

```
stop()
```

### 参数

无。

### 返回值

无（`undefined`）。

还没兑现的 `loadURL()` 以 [`DOMException`](../dom-exception.md) 拒绝，`name` 是 `'AbortError'`，`code` 是 20。系统给的原值在 `cause` 上（一个 [`NSError`](../ns-error.md)），`cause.code` 是 `-999`。没有在加载时调用什么都不发生。

> **注意**：`loadURL` 之后立刻 `stop()`，Promise 以 `AbortError` 拒绝，但**不派发** `did-fail-load`。

### 异常

**`TypeError`**

网页已经销毁：`Object has been destroyed`。

## 示例

```js
const contents = new WebView().webContents;
const loading = contents.loadURL('https://example.com/big');
contents.stop();
loading.catch((err) => {
  const systemCode = err.cause instanceof NSError ? err.cause.code : null;
  console.log(err.name, err.code, systemCode);
});
```

**结果**：输出 `AbortError 20 -999`。

## 和 Electron 的差别

和 Electron 的 `contents.stop()` 相同。对应的 iOS 原生写法是 `[webView stopLoading]`。

## 参见

- [`loadURL()`](loadurl.md)
