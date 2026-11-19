---
type: reference
native: WKScriptMessageHandlerWithReply
---

# `WebContentsIPC`：`handle()` 方法

**`handle()`** 方法给一个频道登记处理函数。网页的预加载脚本对这个频道调 [`ipcRenderer.invoke()`](../ipc-renderer/invoke.md) 时，处理函数被调用，它的返回值就是网页那边拿到的结果。

## 语法

```
handle(channel, listener)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`listener`**

处理函数，形如 `(event, ...args) => value`。

- `event.sender` 是发来请求的 [`webContents`](../web-contents.md)。
- `args` 是网页那边 `invoke(channel, ...args)` 跟在频道名后面的参数，按 JSON 传过来的。
- 返回值，或者它返回的 Promise 兑现的值，按 JSON 传给网页。返回 `undefined` 时网页那边得到 `undefined`。可以是异步函数，网页会一直等到它返回。
- 抛了异常，或者返回的 Promise 被拒绝：网页那边的 Promise 被拒绝，说明是 `Error invoking remote method 'get-user': Error: …`，后面是这边错误的 `String()`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`listener` 不是函数：`handle: the listener must be a function, got …`。

**`Error`**

这个频道已经登记过：`Attempted to register a second handler for 'get-user'`。要换处理函数，先调 [`removeHandler()`](removehandler.md)。

## 说明

- 网页对没有登记的频道调 `invoke`，网页那边被拒绝，说明是 `Error invoking remote method 'get-user': Error: No handler registered for 'get-user'`。
- 请求是网页发来的，参数和 `event.sender` 的地址都要当作不可信的输入检查。只返回这张网页该看到的数据。
- 网页销毁时还没答复的请求，网页那边全部被拒绝。

## 示例

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.ipc.handle('add', async (event, a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') throw new Error('bad arguments');
  return a + b;
});
```

**效果**：预加载脚本里 `await ipcRenderer.invoke('add', 1, 2)` 得到 `3`；`invoke('add', 'x')` 被拒绝，说明是 `Error invoking remote method 'add': Error: bad arguments`。

## 和 Electron 的差别

和 Electron 的 `ipcMain.handle` / `contents.ipc.handle` 相同。处理函数的 `event` 上只有 `sender`；返回值按 JSON 传。

对应的 iOS 原生写法是 `WKScriptMessageHandlerWithReply` 的 `replyHandler`。

## 参见

- [`removeHandler()`](removehandler.md)
- [`ipcRenderer.invoke()`](../ipc-renderer/invoke.md)
