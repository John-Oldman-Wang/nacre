---
type: reference
web: Headers.values()
---

# `Headers`: `values()` method

The **`values()`** method returns an iterator that yields the value of each header in turn.

## Syntax

```
values()
```

### Parameters

None.

### Return value

An iterator whose items are strings. The order is the same as [`entries()`](entries.md): alphabetical order of name, regardless of the order they were added. Names are all lowercase. Multiple values for the same name are joined into one item with `, `; `Set-Cookie` is the exception and appears once per value.

### Exceptions

None.

## Examples

```js
const h = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
console.log(Array.from(h.values()));
```

**Result**: Prints `['a', 'application/json']`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`entries()`](entries.md)
