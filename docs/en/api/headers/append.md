---
type: reference
web: Headers.append()
---

# `Headers`: `append()` method

The **`append()`** method appends a value to a name. Existing values with the same name are kept.

## Syntax

```
append(name, value)
```

### Parameters

**`name`**

The header name, a string, case-insensitive. A non-string is converted to a string first.

**`value`**

The header value, a string. A non-string is converted to a string first. Leading and trailing whitespace (spaces, tabs, carriage returns, line feeds) is removed: `'  v  '` is stored as `'v'`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

Invalid name: `Invalid header name: "坏 名字"`. A name can only consist of letters, digits, and the symbols ``!#$%&'*+-.^_`|~``, and can't be empty.

The value contains NUL, carriage return, or line feed in the middle: `Header value cannot contain NUL, CR or LF`.

## Examples

```js
const h = new Headers();
h.append('Accept', 'a');
h.append('accept', 'b');
console.log(h.get('ACCEPT'));
```

**Result**: Prints `a, b`. Multiple values with the same name are read back joined into one string with `, `.

## Differences from the web

Names aren't restricted: names such as `Host`, `Cookie`, and `Origin` can all be set. Browsers forbid or ignore these names when sending a request.

## See also

- [`set()`](set.md): overwrites instead of appending
- [`getSetCookie()`](getsetcookie.md)
