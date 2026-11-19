---
type: reference
web: WebSocket close event
---

# `WebSocket`：`close` 事件

**`close`** 事件在连接结束时派发。不管连接以哪种方式结束，最后都派发一次，并且只派发一次。

## 语法

```
ws.addEventListener('close', (event) => { })
```

## 事件对象

类型定义里是 `WebSocketCloseEvent`。不能取消。

**`code`**

数，关闭码，说明连接为什么结束。见下面的[关闭码](#关闭码)。

**`reason`**

字符串，对方给的说明。没有时是空字符串。

**`wasClean`**

布尔。`true` 表示双方按协议完成了关闭；`false` 表示连接异常结束。

## 什么时候派发

- App 调 [`close()`](close.md) 后，关闭完成时。
- 服务器主动关闭时。**未在模拟器验证。**
- 没连上，或者连接中途断开时，紧跟在 [`error`](error-event.md) 之后。
- 派发时 [`readyState`](readystate.md) 已经是 `3`。派发之后运行时不再保管这个 `WebSocket`。
- 连接断开后不会自动重连。要重连就在这个事件的回调里新建一个 `WebSocket`。

### 关闭码

| `wasClean` | `code` | 含义 |
| --- | --- | --- |
| `true` | App 调 `close()` 时给的码，默认 `1000` | App 主动关闭，双方按协议完成了关闭 |
| `true` | 服务器给的码 | 服务器主动关闭。**未在模拟器验证** |
| `false` | `1006` | 没连上，或者连接中途断开。`1006` 不是服务器发来的，是本机在连接异常结束时填的 |

常见的码：`1000` 是正常关闭，`1001` 是一方要离开（比如服务器停机），`1008` 是违反了服务器的规则，`1009` 是消息太大，`1011` 是服务器内部出错。`4000` 到 `4999` 留给业务自己定义，含义要看服务器的文档。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('close', (e) => {
  const { code, reason, wasClean } = /** @type {WebSocketCloseEvent} */ (e);
  if (wasClean) {
    console.log('正常关闭', code, reason);
  } else {
    console.log('连接断了', code);
  }
});
```

**效果**：双方按协议完成关闭时输出 `正常关闭` 加关闭码和原因。连接异常结束时输出 `连接断了 1006`。

## 和 Web 的差别

- 没有 `onclose` 属性，只能用 `addEventListener`。
- 事件对象带的 `code`、`reason`、`wasClean` 和 Web 相同。

## 参见

- [`close()`](close.md)
- [保持一条长期使用的连接](../../guides/websocket.md#保持一条长期使用的连接)：在这里重连
