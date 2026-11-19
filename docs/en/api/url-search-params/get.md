---
type: reference
web: URLSearchParams.get()
---

# `URLSearchParams`: `get()` method

The **`get()`** method returns the value of the first parameter with the given name.

## Syntax

```
get(name)
```

### Parameters

**`name`**

The parameter name, a string. Non-string values are converted to strings first.

### Return value

A string: the value of the first parameter named `name`. Returns `null` if there is no such name.

### Exceptions

None.

## Examples

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(q.get('a'), q.get('c'));
```

**Result**: logs `1 null`. `get()` returns only the first; to get all of them, use [`getAll()`](getall.md).

## Differences from the web

Same as the web.

## See also

- [`getAll()`](getall.md): all values with the name
- [`has()`](has.md): only checks whether it exists
