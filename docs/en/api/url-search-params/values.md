---
type: reference
web: URLSearchParams.values()
---

# `URLSearchParams`: `values()` method

The **`values()`** method returns an iterator that yields the value of each parameter in list order.

## Syntax

```
values()
```

### Parameters

None.

### Return value

An iterator; each item is a string.

### Exceptions

None.

## Description

If the list is modified during iteration, the iteration still covers the list as it was at the start. **Not verified in the simulator.**

## Examples

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(Array.from(q.values()));
```

**Result**: logs `['1', '2', '3']`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`keys()`](keys.md)
- [`entries()`](entries.md)
