---
type: reference
web: WebSocket()
---

# `WebSocket()` constructor

The **`WebSocket()`** constructor creates a connection and immediately starts connecting in the background. When the constructor returns, the connection is not yet established and [`readyState`](readystate.md) is `0`; once connected, [`open`](open-event.md) fires.

## Syntax

```
new WebSocket(url)
new WebSocket(url, { headers, protocols })
```

### Parameters

**`url`**

The server's URL, a string. The scheme is `wss:` (encrypted) or `ws:` (unencrypted).

**`options.headers`**

Optional. Request headers for the handshake request, as a plain object whose values are all strings, for example `{ Authorization: 'Bearer abc123' }`. An entry whose value is not a string is ignored without an error. Passing a `Headers` object has no effect.

That the headers actually reach the server is **not verified in the simulator**: the public service used in the acceptance tests does not echo request headers.

**`options.protocols`**

Optional. Subprotocol names, as an array of strings. A subprotocol is an application-level protocol the client supports; the server picks one, and the selected one can be read from [`protocol`](protocol.md). **Subprotocol negotiation is not verified in the simulator.**

### Return value

A new `WebSocket`. Its `readyState` is `0`, [`url`](url.md) is the URL passed in, and [`protocol`](protocol.md) is an empty string.

### Exceptions

**`TypeError`**

`url` is an empty string or cannot be recognized as a URL: `cannot construct WebSocket with these arguments`.

If the URL is valid but the connection fails, nothing is thrown; the failure is reported through the [`error`](error-event.md) and [`close`](close-event.md) events.

## Description

- Until the connection ends, the runtime keeps this object alive. Even if the app's code does not keep a reference to it, the connection keeps working and events keep firing.
- Adding listeners in the same piece of code right after construction does not miss `open`.
- A `WebSocket` connects only once. To connect again after the connection ends, create a new one.

## Examples

```js
const ws = new WebSocket('wss://example.com/quotes', {
  headers: { Authorization: 'Bearer abc123' },
});
console.log(ws.readyState);
```

**Result**: the console logs `0`. The handshake request carries the `Authorization` header.

## Differences from the web

In browsers, the second argument is a subprotocol string or array; here it is an object, `{ headers, protocols }`, with subprotocols in `protocols`. Browsers cannot add custom request headers to the handshake request; here you can.

## See also

- [`open` event](open-event.md): after connecting
- [`close()`](close.md): closes the connection
