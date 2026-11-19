---
type: reference
web: URL.port
---

# `URL`: `port` property

The **`port`** property is the port of the address, as a string.

## Value

A string.

- Readable and writable.
- Reads back as an empty string when the port is the protocol's default port. Protocols with default ports: `http` 80, `https` 443, `ws` 80, `wss` 443, `ftp` 21.
- Also an empty string when the address has no port.
- Writing an empty string removes the port. A number written is converted to a string first.
- Example: the `port` of `https://u:p@a.com:8080/p/q?x=1#f` is `8080`.

### Invalid values

After assignment the whole address is parsed again. When the new value makes the address invalid, the assignment has no effect, the address stays as it was, and nothing is thrown.

## Examples

```js
const u = new URL('https://a.com:443/');
console.log(JSON.stringify(u.port));
u.port = '8443';
console.log(u.host);
```

**Result**: Logs `""`, then `a.com:8443`. The second line is **not verified in the simulator**.

## Differences from the web

Same as the web.

## See also

- [`host`](host.md): host plus port
