---
type: reference
web: WebSocket.url
---

# `WebSocket`：`url` 属性

**`url`** 属性是这条连接的地址。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 构造时传入的地址，不做整理：传 `'wss://echo.websocket.org'`，读回来是 `'wss://echo.websocket.org'`，末尾不补 `/`。
- 不会变。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(ws.url);
```

**结果**：控制台输出 `wss://echo.websocket.org`。

## 和 Web 的差别

浏览器返回整理过的地址：`'wss://echo.websocket.org'` 读出来是 `'wss://echo.websocket.org/'`。这里不做这一步整理，读出来的末尾没有补上的 `/`。

## 参见

- [`WebSocket()`](constructor.md)
