---
type: reference
web: CloseEvent.code
---

# `CloseEvent`: `code` property

The **`code`** property is the close code, which says why the connection ended.

## Value

A number. Common values:

- Read-only. Assigning to it throws `TypeError`.
- `1000`: a normal close.
- `1006`: the connection dropped without completing the closing handshake.
- For other values, see [`close`](../websocket/close-event.md#close-codes).
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('close', (e) => {
  console.log(e.code === 1000 ? '正常关闭' : '异常结束 ' + e.code);
});
```

**Effect**: when the connection ends, a normal close prints `正常关闭`; otherwise it prints `异常结束` and the close code.

## Corresponding iOS API

`closeCode` of `NSURLSessionWebSocketTask`.

## See also

- [`CloseEvent`](../close-event.md)
- [`close`](../websocket/close-event.md)
