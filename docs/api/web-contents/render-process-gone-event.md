---
type: reference
native: "webViewWebContentProcessDidTerminate:"
---

# `WebContents`：`render-process-gone` 事件

**`render-process-gone`** 事件在网页的进程不在了时派发：崩溃了，或者在内存紧张时被系统结束了。

## 语法

```
contents.addEventListener('render-process-gone', (event) => {})
```

## 事件对象

`Event`，没有附加的字段。不说原因。不可取消。

## 什么时候派发

每张网页在自己独立的进程里运行，进程不在了就派发。这时：

- 网页变成空白，App 照常运行。
- [`isCrashed()`](iscrashed.md) 是 `true`。
- 还没完成的 `loadURL`，它的 Promise 被拒绝。

运行时不会自动重新加载。要不要恢复由 App 决定。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('render-process-gone', () => {
  contents.reload();
});
```

**效果**：网页的进程被结束时，网页重新加载，恢复显示。网页里原来的状态（填到一半的表单、脚本里的变量）不会恢复。

## 和 Electron 的差别

Electron 的事件带 `details.reason`，这里没有：系统不说原因。

对应的 iOS 原生写法是 `webViewWebContentProcessDidTerminate:`。

## 参见

- [网页崩溃之后恢复](../../guides/web-pages.md#网页崩溃之后恢复)
