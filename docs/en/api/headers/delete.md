---
type: reference
web: Headers.delete()
---

# `Headers`: `delete()` method

The **`delete()`** method removes all values for a name.

## Syntax

```
delete(name)
```

### Parameters

**`name`**

The header name, a string, case-insensitive. A non-string is converted to a string first.

### Return value

None (`undefined`). Does nothing when the name isn't present.

### Exceptions

**`TypeError`**

Invalid name: `Invalid header name: "坏 名字"`. A name can only consist of letters, digits, and the symbols ``!#$%&'*+-.^_`|~``, and can't be empty.

## Examples

```js
const h = new Headers({ Accept: 'a', 'X-Id': '1' });
h.delete('x-id');
console.log(h.has('X-Id'));
```

**Result**: Prints `false`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`set()`](set.md)
