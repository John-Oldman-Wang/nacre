---
type: reference
web: URLSearchParams.forEach()
---

# `URLSearchParams`: `forEach()` method

The **`forEach()`** method calls a callback once for each parameter, in list order.

## Syntax

```
forEach(callback[, thisArg])
```

### Parameters

**`callback`**

A function called with three arguments: `callback(value, name, params)`. `value` is the value, `name` is the name, and `params` is this `URLSearchParams`.

**`thisArg`**

Optional. The `this` used when calling `callback`.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

Note that the callback receives the value first and the name second. If the list is modified during iteration, the iteration still covers the list as it was at the start. **Not verified in the simulator.**

## Examples

```js
const q = new URLSearchParams('a=1&b=2');
q.forEach((value, name) => {
  console.log(name, value);
});
```

**Result**: logs `a 1` and `b 2`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`entries()`](entries.md)
