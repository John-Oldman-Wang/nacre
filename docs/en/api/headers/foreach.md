---
type: reference
web: Headers.forEach()
---

# `Headers`: `forEach()` method

The **`forEach()`** method calls a callback once for each header.

## Syntax

```
forEach(callback[, thisArg])
```

### Parameters

**`callback`**

A function called with three arguments: `callback(value, name, headers)`. `value` is the value, `name` is the lowercase name, and `headers` is this `Headers`.

**`thisArg`**

Optional. The `this` used when calling `callback`.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

The order is the same as [`entries()`](entries.md). In the callback's arguments, the value comes first and the name second.

## Examples

```js
const h = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
h.forEach((value, name) => {
  console.log(name, value);
});
```

**Result**: Prints `accept a` and `content-type application/json`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`entries()`](entries.md)
