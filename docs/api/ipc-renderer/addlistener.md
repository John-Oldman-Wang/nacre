---
type: reference
native: WKUserScript
---

# `ipcRenderer.addListener()` 方法

**`addListener()`** 方法和 [`on()`](on.md) 相同：在网页这边收 App 发来的某个频道的消息。

只在[预加载脚本](../web-view.md#预加载脚本)里能用。

## 语法

```
ipcRenderer.addListener(channel, listener)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`listener`**

监听器，形如 `(event, ...args) => {}`，和 `on()` 的相同。

### 返回值

`ipcRenderer` 自己。

### 异常

**`TypeError`**

`listener` 不是函数：`The listener must be a function`。

## 示例

```javascript
// JS/web/preload.js
ipcRenderer.addListener('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

**效果**：和用 `on()` 登记相同。**未在模拟器验证。**

## 和 Electron 的差别

和 Electron 的 `ipcRenderer.addListener(channel, listener)` 相同。

## 参见

- [`on()`](on.md)
