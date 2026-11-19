---
type: reference
web: URLSearchParams.has()
---

# `URLSearchParams`: `has()` method

The **`has()`** method checks whether the list contains a given parameter.

## Syntax

```
has(name[, value])
```

### Parameters

**`name`**

The parameter name, a string. Non-string values are converted to strings first.

**`value`**

Optional. When passed, both the name and the value must match.

### Return value

A boolean.

### Exceptions

None.

## Examples

```js
const q = new URLSearchParams('a=1&b=2');
console.log(q.has('a'), q.has('a', '2'), q.has('c'));
```

**Result**: logs `true false false`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`get()`](get.md)
