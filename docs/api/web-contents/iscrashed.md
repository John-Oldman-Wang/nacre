---
type: reference
native: "webViewWebContentProcessDidTerminate:"
---

# `WebContents`：`isCrashed()` 方法

**`isCrashed()`** 方法返回网页的进程是不是已经不在了。

每张网页在自己独立的进程里运行。这个进程可能崩溃，也可能在内存紧张时被系统结束。这时网页变成空白，App 照常运行。

## 语法

```
isCrashed()
```

### 参数

无。

### 返回值

布尔。

- `true`：进程不在了，网页是空白的。
- `false`：进程在。重新加载之后变回 `false`。

变成 `true` 时派发 [`render-process-gone`](render-process-gone-event.md)。

### 异常

**`TypeError`**

网页已经销毁：`Object has been destroyed`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('render-process-gone', () => {
  console.log(contents.isCrashed());
  contents.reload();
});
```

**结果**：网页的进程被结束时输出 `true`，然后网页重新加载，`isCrashed()` 变回 `false`。

## 和 Electron 的差别

和 Electron 的 `contents.isCrashed()` 相同。对应的 iOS 原生写法是 `webViewWebContentProcessDidTerminate:` 回调。

## 参见

- [`render-process-gone`](render-process-gone-event.md)
- [网页崩溃之后恢复](../../guides/web-pages.md#网页崩溃之后恢复)
