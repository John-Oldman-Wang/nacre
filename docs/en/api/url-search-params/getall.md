---
type: reference
web: URLSearchParams.getAll()
---

# `URLSearchParams`: `getAll()` method

The **`getAll()`** method returns the values of all parameters with the given name.

## Syntax

```
getAll(name)
```

### Parameters

**`name`**

The parameter name, a string. Non-string values are converted to strings first.

### Return value

An array of strings, in list order. Returns an empty array if there is no such name.

### Exceptions

None.

## Examples

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(q.getAll('a'));
```

**Result**: logs `['1', '3']`.

## Differences from the web

Same as the web.

## See also

- [`get()`](get.md): only the first one
