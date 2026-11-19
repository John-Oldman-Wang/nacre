---
type: reference
web: URL.href
---

# `URL`: `href` property

The **`href`** property is the full address text.

## Value

A string.

- Readable and writable.
- It reads back in [normalized form](../url.md#addresses-are-normalized), which may differ from the text passed to the constructor.
- When a new address is written, every part is replaced with the new address's; [`searchParams`](searchparams.md) changes along with it.
- Example: the `href` of `https://u:p@a.com:8080/p/q?x=1#f` is that entire string.

### Invalid values

Writing an address that can't be parsed throws `TypeError`, and the address stays as it was:

```
Invalid URL: "…"
```

Relative addresses can't be written either: there is no base to resolve against.

## Examples

```js
const u = new URL('https://a.com/p?x=1');
u.href = 'https://b.com/q';
console.log(u.href, u.searchParams.get('x'));
```

**Result**: Logs `https://b.com/q null`.

## Differences from the web

Non-ASCII domains are not converted to the form starting with `xn--`; see [`hostname`](hostname.md).

## See also

- [`toString()`](tostring.md): returns the same value
- [`URL()`](constructor.md): parsing an address
