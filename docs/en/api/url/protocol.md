---
type: reference
web: URL.protocol
---

# `URL`: `protocol` property

The **`protocol`** property is the protocol of the address, with the trailing colon.

## Value

A string.

- Readable and writable.
- Reads back in lowercase with the trailing colon, such as `https:`.
- When writing, the trailing colon can be omitted; it is added automatically.
- Example: the `protocol` of `https://u:p@a.com:8080/p/q?x=1#f` is `https:`.

### Invalid values

After assignment the whole address is parsed again. When the new value makes the address invalid, the assignment has no effect, the address stays as it was, and nothing is thrown.

## Examples

```js
const u = new URL('http://a.com/x');
u.protocol = 'https';
console.log(u.href);
```

**Result**: Logs `https://a.com/x`.

## Differences from the web

Same as the web.

## See also

- [Addresses are normalized](../url.md#addresses-are-normalized)
