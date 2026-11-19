---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `WebContentsIPC`：`removeHandler()` 方法

**`removeHandler()`** 方法去掉一个频道的处理函数。之后网页对这个频道调 `invoke`，按没有登记处理。

## 语法

```
removeHandler(channel)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

### 返回值

无（`undefined`）。

### 异常

无。没登记过的频道也不报错。

## 示例

```js
const ipc = new WebView().webContents.ipc;
ipc.handle('ask', () => 1);
ipc.removeHandler('ask');
ipc.handle('ask', () => 2);
```

**效果**：不抛。去掉之后可以重新登记；网页那边 `invoke('ask')` 得到 `2`。在两次登记之间调 `invoke('ask')` 的话被拒绝，说明是 `Error invoking remote method 'ask': Error: No handler registered for 'ask'`。

## 和 Electron 的差别

和 Electron 的 `contents.ipc.removeHandler(channel)` 相同。

## 参见

- [`handle()`](handle.md)
