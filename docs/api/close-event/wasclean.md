---
type: reference
web: CloseEvent.wasClean
---

# `CloseEvent`：`wasClean` 属性

**`wasClean`** 属性表示双方有没有按协议完成关闭。

## 值

布尔值。

- 只读。给它赋值抛 `TypeError`。
- `true`：走完了关闭握手。
- `false`：连接断了，比如网络中断。
- 用 [`new`](constructor.md) 创建时没给，是 `false`。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('close', (e) => {
  if (!e.wasClean) {
    console.log('连接断了，稍后重连');
  }
});
```

**效果**：连接异常结束时输出 `连接断了，稍后重连`。

## 对应的 iOS API

没有对应的系统 API。由连接是不是收到了关闭帧得出。

## 参见

- [`CloseEvent`](../close-event.md)
