---
type: reference
web: WebSocket.close()
---

# `WebSocket`：`close()` 方法

**`close()`** 方法关闭连接。它立刻返回，关闭完成后派发 [`close`](close-event.md) 事件。

## 语法

```
close()
close(code)
close(code, reason)
```

### 参数

**`code`**

可选。关闭码，整数，按 `Number(v)` 转换后向零取整。不传或传 `null` 时用 `1000`（正常关闭）。常用的码见 [`close` 事件](close-event.md#关闭码)。

**`reason`**

可选。给服务器的说明，字符串。不传时不带说明。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`code` 转不成有限数：`code must be a finite number, got …`。

## 说明

- 调用后 [`readyState`](readystate.md) 立刻变成 `2`。关闭完成后派发 `close`，`readyState` 变成 `3`，事件的 `code` 是这里给的码，`wasClean` 是 `true`。
- 连接正在关闭或已经结束时再调，什么也不做，不报错。
- 连接还在连接中时调用，`readyState` 变成 `2`。之后派发哪些事件，**未在模拟器验证**。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  ws.close(1000, 'bye');
  console.log(ws.readyState === WebSocket.CLOSING);
});
ws.addEventListener('close', (e) => {
  console.log(/** @type {WebSocketCloseEvent} */ (e).code);
});
```

**结果**：连上后输出 `true`；关闭完成后输出 `1000`。

## 和 Web 的差别

浏览器对 `code` 有限制：只接受 `1000` 或 `3000` 到 `4999`，否则抛 `InvalidAccessError`。这里不检查范围，任何整数都交给系统发出。范围以外的码发出去之后服务器怎么处理，**未在模拟器验证**。

## 参见

- [`close` 事件](close-event.md)
