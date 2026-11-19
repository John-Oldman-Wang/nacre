---
type: reference
native: WKScriptMessageHandler
---

# `ipcRenderer.send()` 方法

**`send()`** 方法从网页给 App 发一条消息，不等回复。App 在 `webContents` 的 [`ipc-message`](../web-contents/ipc-message-event.md) 事件里收到。

只在[预加载脚本](../web-view.md#预加载脚本)里能用。

## 语法

```
ipcRenderer.send(channel, ...args)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`args`**

任意个参数，按 JSON 传，见[值怎么传](../web-contents.md#值怎么传)。App 收到的是事件的 `args` 数组。

### 返回值

无（`undefined`）。App 收没收到不告诉网页。

### 异常

**`TypeError`**

参数里有函数：`ipcRenderer.send: functions cannot be sent`。有 symbol 时是 `ipcRenderer.send: symbols cannot be sent`。在网页里当场抛。

## 说明

`<iframe>` 里发来的消息 App 不接收。

## 示例

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  say: (text) => ipcRenderer.send('say', text, { at: 1 }),
});
```

**效果**：网页调 `app.say('hi')` 时，App 收到一次 `ipc-message`，`e.channel` 是 `'say'`，`e.args` 是 `['hi', { at: 1 }]`。

## 和 Electron 的差别

和 Electron 的 `ipcRenderer.send(channel, ...args)` 相同。参数按 JSON 传，不是结构化克隆，带了函数当场抛。

## 参见

- [`ipc-message`](../web-contents/ipc-message-event.md)：App 这一头怎么收
- [`invoke()`](invoke.md)：要等 App 回一个结果时用它
