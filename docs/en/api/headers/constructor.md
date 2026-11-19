---
type: reference
web: Headers()
---

# `Headers()` constructor

The **`Headers()`** constructor creates a set of request or response headers.

## Syntax

```
new Headers([init])
```

### Parameters

**`init`**

Optional. The initial contents. Omitting it, or passing `null` or `undefined`, gives an empty set.

| Form | Example | Description |
| --- | --- | --- |
| Plain object | `{ Accept: 'a' }` | One header per property |
| Array | `[['Accept', 'a'], ['Accept', 'b']]` | Can represent multiple values for the same name. Each item must have exactly two elements |
| Another `Headers` | | Makes a copy; the two don't affect each other afterward |

Each item in an object or array is added as with [`append()`](append.md), with the same rules for checking names and values.

### Return value

A new `Headers`.

### Exceptions

**`TypeError`**

- In the array form, an item isn't an array of exactly two elements: `Headers in array form needs every entry to be [name, value]`
- Invalid name: `Invalid header name: "坏 名字"`
- The value contains NUL, carriage return, or line feed in the middle: `Header value cannot contain NUL, CR or LF`

## Examples

```js
const h = new Headers({ 'Content-Type': 'application/json' });
console.log(h.get('content-type'));
```

**Result**: Prints `application/json`.

## Differences from the web

Names aren't restricted: names such as `Host`, `Cookie`, and `Origin` can all be set. Browsers forbid or ignore these names when sending a request.

## See also

- [`append()`](append.md): rules for checking names and values
- [`fetch()`](../fetch.md): using `Headers` as request headers
