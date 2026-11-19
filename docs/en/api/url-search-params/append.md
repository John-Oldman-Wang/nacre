---
type: reference
web: URLSearchParams.append()
---

# `URLSearchParams`: `append()` method

The **`append()`** method adds a parameter at the end of the list, whether or not one with the same name exists.

## Syntax

```
append(name, value)
```

### Parameters

**`name`**

The parameter name, a string. Non-string values are converted to strings first.

**`value`**

The parameter value, a string. Non-string values are converted to strings first.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

When this list is the [`searchParams`](../url/searchparams.md) of a `URL`, the URL's `search` and `href` change with it.

## Examples

```js
const q = new URLSearchParams('a=1');
q.append('a', '2');
q.append('c', '中 文');
console.log(q.toString());
```

**Result**: logs `a=1&a=2&c=%E4%B8%AD+%E6%96%87`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`set()`](set.md): replacing instead of appending
