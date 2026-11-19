---
type: reference
web: URLSearchParams.set()
---

# `URLSearchParams`: `set()` method

The **`set()`** method sets the parameter with a given name to one value.

## Syntax

```
set(name, value)
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

- If parameters with the name exist, the first one gets the new value and keeps its position; the other ones with that name are deleted.
- If none exist, it is added at the end.
- When this list is the [`searchParams`](../url/searchparams.md) of a `URL`, the URL's `search` and `href` change with it.

## Examples

```js
const q = new URLSearchParams('a=1&b=2&a=3');
q.set('a', '9');
console.log(q.toString());
```

**Result**: logs `a=9&b=2`.

## Differences from the web

Same as the web.

## See also

- [`append()`](append.md): appending instead of replacing
