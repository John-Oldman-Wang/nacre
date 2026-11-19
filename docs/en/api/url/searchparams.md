---
type: reference
web: URL.searchParams
---

# `URL`: `searchParams` property

The **`searchParams`** property is the query parameters of the address, a [`URLSearchParams`](../url-search-params.md).

## Value

A [`URLSearchParams`](../url-search-params.md).

- Read-only. Assigning to it throws `TypeError`. The object it returns can be modified.
- Every read returns the same object.
- It stays in sync with [`search`](search.md): changing `searchParams` changes `search` and [`href`](href.md); changing `search` or `href` changes `searchParams`.
- Values written through it are encoded: spaces as `+`, and Chinese characters as UTF-8 `%XX`.

## Examples

```js
const u = new URL('https://api.example.com/search');
u.searchParams.set('q', '中 文');
u.searchParams.append('k2', 'v2');
console.log(u.href);
console.log(u.searchParams === u.searchParams);
```

**Result**: Logs `https://api.example.com/search?q=%E4%B8%AD+%E6%96%87&k2=v2`, then `true`.

## Differences from the web

Same as the web.

## See also

- [`URLSearchParams`](../url-search-params.md): all the methods for query parameters
- [`search`](search.md): the text of the query part
