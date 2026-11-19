---
type: reference
web: URLSearchParams.keys()
---

# `URLSearchParams`: `keys()` method

The **`keys()`** method returns an iterator that yields the name of each parameter in list order.

## Syntax

```
keys()
```

### Parameters

None.

### Return value

An iterator; each item is a string. Each parameter with a repeated name appears once.

### Exceptions

None.

## Description

If the list is modified during iteration, the iteration still covers the list as it was at the start. **Not verified in the simulator.**

## Examples

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(Array.from(q.keys()));
```

**Result**: logs `['a', 'b', 'a']`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`values()`](values.md)
- [`entries()`](entries.md)
