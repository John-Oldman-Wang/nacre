---
type: reference
web: URL.hash
---

# `URL`: `hash` property

The **`hash`** property is the fragment part of the address, with the leading `#`.

## Value

A string.

- Readable and writable.
- An empty string when there is no fragment.
- When writing, the leading `#` can be omitted; it is added automatically. Writing an empty string or `'#'` removes the fragment.
- The written content goes into the address as-is, without encoding.
- Example: the `hash` of `https://u:p@a.com:8080/p/q?x=1#f` is `#f`.

## Examples

```js
const w = new URL('https://a.com/p');
w.hash = 'top';
console.log(w.href);
```

**Result**: Logs `https://a.com/p#top`.

## Differences from the web

Browsers encode characters such as spaces when writing; here they are written as-is.

## See also

- [Addresses are normalized](../url.md#addresses-are-normalized)
