---
type: reference
native: WKUserScript
---

# `ipcRenderer.on()` 方法

**`on()`** 方法在网页这边收 App 用 [`webContents.send()`](../web-contents/send.md) 发来的某个频道的消息。

只在[预加载脚本](../web-view.md#预加载脚本)里能用。

## 语法

```
ipcRenderer.on(channel, listener)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`listener`**

监听器，形如 `(event, ...args) => {}`。`event.sender` 是 `ipcRenderer` 自己；`args` 是 App 那边 `send(channel, ...args)` 跟在频道名后面的参数。

同一个频道可以登记多个监听器，按登记的顺序调用。一个监听器抛了异常，错误打到网页的控制台，其余的照常调用。

### 返回值

`ipcRenderer` 自己，可以接着调。

### 异常

**`TypeError`**

`listener` 不是函数：`The listener must be a function`。

## 说明

网页里的脚本也能往消息通道里塞消息，冒充 App。这里收到的消息不能当作一定来自 App。

## 示例

```javascript
// JS/web/preload.js
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

**效果**：App 调 `contents.send('theme', 'dark')` 之后，网页的 `<html>` 上多了 `data-theme="dark"`。

## 和 Electron 的差别

和 Electron 的 `ipcRenderer.on(channel, listener)` 相同。`event` 上只有 `sender`。

## 参见

- [`webContents.send()`](../web-contents/send.md)：App 这一头怎么发
- [`once()`](once.md)、[`off()`](off.md)
