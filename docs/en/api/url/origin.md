---
type: reference
web: URL.origin
---

# `URL`: `origin` property

The **`origin`** property is the protocol, host, and port of the address joined together.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- Only `http` and `https` addresses have a value; for all other protocols it is the string `'null'`.
- The protocol's default port does not appear.
- Example: the `origin` of `https://u:p@a.com:8080/p/q?x=1#f` is `https://a.com:8080`.

## Examples

```js
console.log(new URL('https://a.com:443/x').origin);
console.log(new URL('wss://a.com/chat').origin);
```

**Result**: Logs `https://a.com`, then `null`.

## Differences from the web

In browsers, the `origin` of `ws:`, `wss:`, and `ftp:` addresses is protocol plus host plus port; here it is `'null'`.

## See also

- [`protocol`](protocol.md), [`host`](host.md): the two parts that make up `origin`
