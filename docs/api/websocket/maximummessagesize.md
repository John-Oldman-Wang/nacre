---
type: reference
native: NSURLSessionWebSocketTask.maximumMessageSize
---

# `WebSocket`：`maximumMessageSize` 属性

**`maximumMessageSize`** 属性是这条连接能接收的单条消息的最大长度。

## 值

数，单位是字节。

- 可读，可写。
- 默认值是 `1048576`（1 MB）。这个值是实测得到的。
- 收到的消息超过这个长度时接收失败。**超过时具体发生什么未在模拟器验证**，只验证了这个值能读能写。
- 只有 App 自己会改它，所以没有变化的事件。

### 写错时

写入的值按 `Number(v)` 转换后向零取整。转换结果不是有限数时抛 `TypeError`：`maximumMessageSize must be a finite number, got …`。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.maximumMessageSize = 4096;
console.log(ws.maximumMessageSize);
```

**结果**：控制台输出 `4096`。

## 和 Web 的差别

Web 没有这个属性。对应 iOS 的 `NSURLSessionWebSocketTask.maximumMessageSize`。

## 参见

- [`message` 事件](message-event.md)
