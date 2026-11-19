---
type: reference
web: Headers.get()
---

# `Headers`: `get()` method

The **`get()`** method returns the value for a name.

## Syntax

```
get(name)
```

### Parameters

**`name`**

The header name, a string, case-insensitive. A non-string is converted to a string first.

### Return value

A string. Multiple values are joined into one string with `, ` (comma and space). Returns `null` when the name isn't present.

### Exceptions

**`TypeError`**

Invalid name: `Invalid header name: "坏 名字"`. A name can only consist of letters, digits, and the symbols ``!#$%&'*+-.^_`|~``, and can't be empty.

## Description

A `Set-Cookie` value can itself contain commas, so once joined into one string the values can't be separated. Use [`getSetCookie()`](getsetcookie.md) to read it.

## Examples

```js
const h = new Headers();
h.append('Accept', 'a');
h.append('accept', 'b');
console.log(h.get('ACCEPT'), h.get('X-None'));
```

**Result**: Prints `a, b null`.

## Differences from the web

Same as on the web.

## See also

- [`getSetCookie()`](getsetcookie.md)
- [`has()`](has.md)
