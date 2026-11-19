---
type: reference
web: WebSocket.readyState
---

# `WebSocket`: `readyState` property

The **`readyState`** property indicates the stage the connection is in right now.

## Value

A number, one of the following four:

| Value | Constant | Meaning |
| --- | --- | --- |
| `0` | [`WebSocket.CONNECTING`](connecting.md) | Connecting; messages cannot be sent yet |
| `1` | [`WebSocket.OPEN`](open.md) | Connected; messages can be sent and received |
| `2` | [`WebSocket.CLOSING`](closing.md) | Closing |
| `3` | [`WebSocket.CLOSED`](closed.md) | Ended |

- Read-only. Assigning to it throws `TypeError`.
- A new connection is `0`.
- It only moves in the direction `0` → `1` → `2` → `3` and never goes back. When the connection fails or drops partway through, it goes straight from `0` or `1` to `3`.

### Observing changes

- When it becomes `1`, [`open`](open-event.md) fires.
- When it becomes `3`, [`close`](close-event.md) fires.
- It becomes `2` immediately after [`close()`](close.md) is called; this change has no event, because it is caused by the app's own call.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  console.log(ws.readyState === WebSocket.OPEN);
  ws.close();
  console.log(ws.readyState === WebSocket.CLOSING);
});
```

**Result**: once connected, logs `true`, then `true`.

## Differences from the web

The same as on the web.

## See also

- [The four stages of a connection](../websocket.md#the-four-stages-of-a-connection)
