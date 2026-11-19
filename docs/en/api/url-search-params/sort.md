---
type: reference
web: URLSearchParams.sort()
---

# `URLSearchParams`: `sort()` method

The **`sort()`** method sorts the parameters by name.

## Syntax

```
sort()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const q = new URLSearchParams('b=1&a=2&b=0&a=1');
q.sort();
console.log(q.toString());
```

**Result**: logs `a=2&a=1&b=1&b=0`. Names are compared by UTF-16 code units; parameters with the same name keep their original order. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`toString()`](tostring.md)
