---
type: reference
native: WKUserScript
---

# `ipcRenderer.removeAllListeners()` 方法

**`removeAllListeners()`** 方法去掉一个频道上的全部监听器；不给频道时去掉所有频道的。

只在[预加载脚本](../web-view.md#预加载脚本)里能用。

## 语法

```
ipcRenderer.removeAllListeners([channel])
```

### 参数

**`channel`** <small>可选</small>

频道名，字符串。不是字符串的按 `String()` 转。不传（或者传 `undefined`）时去掉所有频道的监听器。

### 返回值

`ipcRenderer` 自己。

### 异常

无。

## 示例

```javascript
// JS/web/preload.js
ipcRenderer.on('to-page', (event, value) => console.log(value));
contextBridge.exposeInMainWorld('app', {
  mute: () => ipcRenderer.removeAllListeners('to-page'),
});
```

**效果**：网页调 `app.mute()` 之后，App 再发 `to-page` 消息，网页不再收到。

## 和 Electron 的差别

和 Electron 的 `ipcRenderer.removeAllListeners([channel])` 相同。

## 参见

- [`off()`](off.md)
