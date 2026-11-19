---
type: reference
web: URLSearchParams()
---

# `URLSearchParams()` constructor

The **`URLSearchParams()`** constructor creates a list of query parameters.

## Syntax

```
new URLSearchParams([init])
```

### Parameters

**`init`**

Optional. The initial contents of the list, in one of four forms. Passing nothing, `null`, or `undefined` gives an empty list.

| Form | Example | Description |
| --- | --- | --- |
| String | `'a=1&b=2'` | A leading `?` is ignored. `+` decodes to a space, and `%XX` is decoded as UTF-8. Malformed percent-encoding is kept as is |
| Object | `{ a: '1', b: '2' }` | One parameter per property |
| Array | `[['a', '1'], ['a', '2']]` | Can represent several parameters with the same name. Each entry must have exactly two elements |
| Another `URLSearchParams` | | Makes a copy; afterward the two don't affect each other |

Names and values that aren't strings are converted to strings first.

### Return value

A new `URLSearchParams`. It doesn't belong to any `URL`, and changing it doesn't affect other objects.

### Exceptions

**`TypeError`**

An entry in the array form is not an array of exactly two elements: `URLSearchParams in array form needs every entry to be [name, value]`

## Examples

```js
const q = new URLSearchParams('?a=1&b=x+y');
console.log(q.get('b'), q.size);
const r = new URLSearchParams([['a', '1'], ['a', '2']]);
console.log(r.getAll('a'));
```

**Result**: logs `x y 2`, then `['1', '2']`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`URL.searchParams`](../url/searchparams.md): the one that stays in sync with a URL
