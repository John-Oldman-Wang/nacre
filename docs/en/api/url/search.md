---
type: reference
web: URL.search
---

# `URL`: `search` property

The **`search`** property is the query part of the address, with the leading `?`.

## Value

A string.

- Readable and writable.
- An empty string when there is no query.
- When writing, the leading `?` can be omitted; it is added automatically. Writing an empty string or `'?'` removes the query.
- **The written content goes into the address as-is, without encoding.** When a value contains spaces, `&`, `=`, or Chinese characters, use [`searchParams`](searchparams.md) instead; it handles the encoding.
- After writing, [`searchParams`](searchparams.md) changes along with it; after changing `searchParams`, `search` changes too.
- Example: the `search` of `https://u:p@a.com:8080/p/q?x=1#f` is `?x=1`.

## Examples

```js
const u = new URL('https://a.com/?k=1');
u.search = 'z=9';
console.log(u.search, u.searchParams.get('z'));
```

**Result**: Logs `?z=9 9`.

## Differences from the web

Browsers encode characters such as spaces when writing; here they are written as-is.

## See also

- [`searchParams`](searchparams.md): reading and writing query parameters by name
