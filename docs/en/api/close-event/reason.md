---
type: reference
web: CloseEvent.reason
---

# `CloseEvent`: `reason` property

The **`reason`** property is the reason given by the side that closed the connection.

## Value

A string. It is an empty string when no reason was given.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => ws.close(1000, 'bye'));
ws.addEventListener('close', (e) => {
  console.log(e.reason);
});
```

**Effect**: the connection closes right after opening, and prints `bye`. **Not verified in the simulator.**

## Corresponding iOS API

`closeReason` of `NSURLSessionWebSocketTask`, decoded as UTF-8 into a string.

## See also

- [`CloseEvent`](../close-event.md)
