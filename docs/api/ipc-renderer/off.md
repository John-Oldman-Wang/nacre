---
type: reference
native: WKUserScript
---

# `ipcRenderer.off()` 方法

**`off()`** 方法去掉用 [`on()`](on.md) 或 [`once()`](once.md) 登记的一个监听器。之后这个监听器不再收到消息。

只在[预加载脚本](../web-view.md#预加载脚本)里能用。

## 语法

```
ipcRenderer.off(channel, listener)
```

### 参数

**`channel`**

频道名，字符串。不是字符串的按 `String()` 转。

**`listener`**

要去掉的监听器，必须是登记时传的同一个函数。同一个函数登记了几次时，只去掉一次。

### 返回值

`ipcRenderer` 自己。

### 异常

无。频道或者监听器没登记过也不报错。

## 示例

```javascript
// JS/web/preload.js
const onTheme = (event, name) => {
  document.documentElement.dataset.theme = name;
};
ipcRenderer.on('theme', onTheme);
ipcRenderer.off('theme', onTheme);
```

**效果**：App 再发 `theme` 消息，网页不再收到。

## 和 Electron 的差别

和 Electron 的 `ipcRenderer.off(channel, listener)` 相同。

## 参见

- [`removeListener()`](removelistener.md)：同一个方法的另一个名字
- [`removeAllListeners()`](removealllisteners.md)
