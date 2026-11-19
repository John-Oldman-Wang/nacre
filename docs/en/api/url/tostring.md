---
type: reference
web: URL.toString()
---

# `URL`: `toString()` method

The **`toString()`** method returns the full address text, the same as [`href`](href.md).

## Syntax

```
toString()
```

### Parameters

None.

### Return value

A string, equal to [`href`](href.md).

### Exceptions

None.

## Examples

```js
const u = new URL('https://a.com/x?y=1');
console.log(u.toString() === u.href, `${u}`);
```

**Result**: Logs `true https://a.com/x?y=1`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`href`](href.md)
- [`toJSON()`](tojson.md)
