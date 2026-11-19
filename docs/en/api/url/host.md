---
type: reference
web: URL.host
---

# `URL`: `host` property

The **`host`** property is the host plus port of the address.

## Value

A string.

- Readable and writable.
- The host is read back in lowercase.
- The port does not appear when it is the protocol's default port; see [`port`](port.md).
- Example: the `host` of `https://u:p@a.com:8080/p/q?x=1#f` is `a.com:8080`.

### Invalid values

After assignment the whole address is parsed again. When the new value makes the address invalid, the assignment has no effect, the address stays as it was, and nothing is thrown.

## Examples

```js
const u = new URL('https://EXAMPLE.com:443/x');
console.log(u.host);
u.host = 'b.com:8080';
console.log(u.href);
```

**Result**: Logs `example.com`, then `https://b.com:8080/x`. The second line is **not verified in the simulator**.

## Differences from the web

Non-ASCII domains are not converted to the form starting with `xn--`; see [`hostname`](hostname.md).

## See also

- [`hostname`](hostname.md): only the host, without the port
- [`port`](port.md): only the port
