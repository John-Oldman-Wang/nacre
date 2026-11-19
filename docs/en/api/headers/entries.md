---
type: reference
web: Headers.entries()
---

# `Headers`: `entries()` method

The **`entries()`** method returns an iterator that yields `[name, value]` for each header in turn.

## Syntax

```
entries()
```

### Parameters

None.

### Return value

An iterator whose items are arrays of two strings, `[name, value]`. Items come in alphabetical order of name, regardless of the order they were added. Names are all lowercase. Multiple values for the same name are joined into one item with `, `; `Set-Cookie` is the exception and appears once per value.

### Exceptions

None.

## Description

Iterating a `Headers` directly with `for...of` is the same as iterating `entries()`.

## Examples

```js
const h = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
for (const [name, value] of h) {
  console.log(name, value);
}
```

**Result**: Prints `accept a` and `content-type application/json`.

## Differences from the web

Same as on the web.

## See also

- [`keys()`](keys.md)
- [`values()`](values.md)
- [`forEach()`](foreach.md)
