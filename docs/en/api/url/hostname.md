---
type: reference
web: URL.hostname
---

# `URL`: `hostname` property

The **`hostname`** property is the host of the address, without the port.

## Value

A string.

- Readable and writable.
- Read back in lowercase.
- Writing it leaves the port unchanged.
- Example: the `hostname` of `https://u:p@a.com:8080/p/q?x=1#f` is `a.com`.

### Invalid values

After assignment the whole address is parsed again. When the new value makes the address invalid, the assignment has no effect, the address stays as it was, and nothing is thrown.

## Examples

```js
const u = new URL('https://a.com:8080/x');
u.hostname = 'b.com';
console.log(u.host);
```

**Result**: Logs `b.com:8080`. **Not verified in the simulator.**

## Differences from the web

In browsers, non-ASCII domains are converted to the form starting with `xn--`: the `hostname` of `https://例え.jp` is `xn--r8jz45g.jp`. Here it is `%E4%BE%8B%E3%81%88.jp`. This comes from comparison testing against Chrome; there is no assertion for it in the acceptance tests. Whether a request to such an address succeeds is **not verified in the simulator**.

## See also

- [`host`](host.md): host plus port
