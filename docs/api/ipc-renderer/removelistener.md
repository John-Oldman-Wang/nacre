---
type: reference
native: WKUserScript
---

# `ipcRenderer.removeListener()` 方法

**`removeListener()`** 方法和 [`off()`](off.md) 相同：去掉一个频道上登记的一个监听器。

只在[预加载脚本](../web-view.md#预加载脚本)里能用。

## 语法

```
ipcRenderer.removeListener(channel, listener)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`listener`**

要去掉的监听器，必须是登记时传的同一个函数。

### 返回值

`ipcRenderer` 自己。

### 异常

无。没登记过也不报错。

## 示例

```javascript
// JS/web/preload.js
const onTheme = (event, name) => console.log(name);
ipcRenderer.on('theme', onTheme);
ipcRenderer.removeListener('theme', onTheme);
```

**效果**：App 再发 `theme` 消息，`onTheme` 不再被调用。**未在模拟器验证。**

## 和 Electron 的差别

和 Electron 的 `ipcRenderer.removeListener(channel, listener)` 相同。

## 参见

- [`off()`](off.md)
