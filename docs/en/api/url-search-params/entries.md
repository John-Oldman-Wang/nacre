---
type: reference
web: URLSearchParams.entries()
---

# `URLSearchParams`: `entries()` method

The **`entries()`** method returns an iterator that yields `[name, value]` for each parameter in list order.

## Syntax

```
entries()
```

### Parameters

None.

### Return value

An iterator; each item is an array of two strings, `[name, value]`.

### Exceptions

None.

## Description

Iterating a `URLSearchParams` directly with `for...of` is the same as iterating `entries()`. If the list is modified during iteration, the iteration still covers the list as it was at the start. **Not verified in the simulator.**

## Examples

```js
const q = new URLSearchParams('a=1&b=2');
for (const [name, value] of q) {
  console.log(name, value);
}
```

**Result**: logs `a 1` and `b 2`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`forEach()`](foreach.md)
