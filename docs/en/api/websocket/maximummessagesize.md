---
type: reference
native: NSURLSessionWebSocketTask.maximumMessageSize
---

# `WebSocket`: `maximumMessageSize` property

The **`maximumMessageSize`** property is the maximum size of a single message this connection can receive.

## Value

A number, in bytes.

- Readable and writable.
- The default is `1048576` (1 MB). This value was measured.
- Receiving a message larger than this fails. **What exactly happens when it is exceeded is not verified in the simulator**; only reading and writing the value has been verified.
- Only the app itself changes it, so there is no change event.

### Invalid values

A written value is converted with `Number(v)` and truncated toward zero. If the result is not a finite number, it throws `TypeError`: `maximumMessageSize must be a finite number, got …`.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.maximumMessageSize = 4096;
console.log(ws.maximumMessageSize);
```

**Result**: the console logs `4096`.

## Differences from the web

The web has no such property. It corresponds to iOS's `NSURLSessionWebSocketTask.maximumMessageSize`.

## See also

- [`message` event](message-event.md)
