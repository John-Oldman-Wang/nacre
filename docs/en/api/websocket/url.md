---
type: reference
web: WebSocket.url
---

# `WebSocket`: `url` property

The **`url`** property is the URL of this connection.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- The URL passed to the constructor, without normalization: pass `'wss://echo.websocket.org'` and it reads back as `'wss://echo.websocket.org'`, with no trailing `/` added.
- It never changes.

## Examples

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(ws.url);
```

**Result**: the console logs `wss://echo.websocket.org`.

## Differences from the web

Browsers return a normalized URL: `'wss://echo.websocket.org'` reads back as `'wss://echo.websocket.org/'`. This normalization step is not done here, so the value read back has no added trailing `/`.

## See also

- [`WebSocket()`](constructor.md)
