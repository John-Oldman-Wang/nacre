---
type: reference
web: Headers.has()
---

# `Headers`: `has()` method

The **`has()`** method checks whether a header with a given name is present.

## Syntax

```
has(name)
```

### Parameters

**`name`**

The header name, a string, case-insensitive. A non-string is converted to a string first.

### Return value

A boolean.

### Exceptions

**`TypeError`**

Invalid name: `Invalid header name: "坏 名字"`. A name can only consist of letters, digits, and the symbols ``!#$%&'*+-.^_`|~``, and can't be empty.

## Examples

```js
const h = new Headers({ Accept: 'a' });
console.log(h.has('accept'), h.has('Cookie'));
```

**Result**: Prints `true false`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`get()`](get.md)
