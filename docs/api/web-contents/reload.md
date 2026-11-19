---
type: reference
native: "-[WKWebView reload]"
---

# `WebContents`：`reload()` 方法

**`reload()`** 方法重新加载当前的地址。

## 语法

```
reload()
```

### 参数

无。

### 返回值

无（`undefined`）。要知道加载的结果，监听 [`did-finish-load`](did-finish-load-event.md) 和 [`did-fail-load`](did-fail-load-event.md)。

### 异常

**`TypeError`**

网页已经销毁：`Object has been destroyed`。

## 说明

- 派发一轮加载事件，和 `loadURL()` 一样。不派发 `will-navigate`。
- 网页的进程不在了（[`isCrashed()`](iscrashed.md) 是 `true`）时，`reload()` 让网页重新加载，恢复显示。网页里原来的状态（填到一半的表单、脚本里的变量）不会恢复。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('render-process-gone', () => {
  contents.reload();
});
```

**效果**：网页的进程被结束时，网页重新加载，恢复显示。

## 和 Electron 的差别

和 Electron 的 `contents.reload()` 相同。对应的 iOS 原生写法是 `[webView reload]`。

## 参见

- [`render-process-gone`](render-process-gone-event.md)
