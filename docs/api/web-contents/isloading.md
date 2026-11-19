---
type: reference
native: WKWebView.loading
---

# `WebContents`：`isLoading()` 方法

**`isLoading()`** 方法返回网页是不是正在加载。

## 语法

```
isLoading()
```

### 参数

无。

### 返回值

布尔。

- `true`：正在加载。调 `loadURL()` 之后立刻就是 `true`。
- `false`：没有在加载。

变成 `true` 时派发 [`did-start-loading`](did-start-loading-event.md)，变回 `false` 时派发 [`did-stop-loading`](did-stop-loading-event.md)。

### 异常

**`TypeError`**

网页已经销毁：`Object has been destroyed`。

## 示例

```js
const contents = new WebView().webContents;
contents.loadURL('https://example.com/');
console.log(contents.isLoading());
contents.addEventListener('did-stop-loading', () => console.log(contents.isLoading()));
```

**结果**：先输出 `true`，加载结束后输出 `false`。

## 和 Electron 的差别

和 Electron 的 `contents.isLoading()` 相同。对应的 iOS 原生成员是 `WKWebView.loading`。

## 参见

- [`did-start-loading`](did-start-loading-event.md)、[`did-stop-loading`](did-stop-loading-event.md)
