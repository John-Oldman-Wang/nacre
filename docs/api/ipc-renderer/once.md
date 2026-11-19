---
type: reference
native: WKUserScript
---

# `ipcRenderer.once()` 方法

**`once()`** 方法在网页这边收 App 发来的某个频道的消息，只收一次。收到第一条之后监听器自动去掉。

只在[预加载脚本](../web-view.md#预加载脚本)里能用。

## 语法

```
ipcRenderer.once(channel, listener)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`listener`**

监听器，形如 `(event, ...args) => {}`，和 [`on()`](on.md) 的相同。

### 返回值

`ipcRenderer` 自己。

### 异常

**`TypeError`**

`listener` 不是函数：`The listener must be a function`。

## 示例

```javascript
// JS/web/preload.js
ipcRenderer.once('ready', (event, value) => {
  console.log('收到', value);
});
```

**效果**：App 连着调两次 `contents.send('ready', 'a')`、`contents.send('ready', 'b')`，网页的控制台只输出 `收到 a`。

## 和 Electron 的差别

和 Electron 的 `ipcRenderer.once(channel, listener)` 相同。

## 参见

- [`on()`](on.md)
