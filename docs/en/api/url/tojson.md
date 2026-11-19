---
type: reference
web: URL.toJSON()
---

# `URL`: `toJSON()` method

The **`toJSON()`** method returns the full address text, the same as [`href`](href.md). `JSON.stringify()` calls it when it encounters a `URL`.

## Syntax

```
toJSON()
```

### Parameters

None.

### Return value

A string, equal to [`href`](href.md).

### Exceptions

None.

## Examples

```js
const u = new URL('https://a.com/x');
console.log(JSON.stringify({ link: u }));
```

**Result**: Logs `{"link":"https://a.com/x"}`. The address is written into the JSON as a quoted string. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`href`](href.md)
- [`toString()`](tostring.md)
