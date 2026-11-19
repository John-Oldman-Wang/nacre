---
type: reference
web: URL.parse()
---

# `URL.parse()` static method

The **`URL.parse()`** static method parses address text and returns `null` when it can't be parsed. It does not throw.

## Syntax

```
URL.parse(url[, base])
```

### Parameters

**`url`**

Address text, or a `URL`.

**`base`**

Optional. The base for resolving a relative address. Same as the `base` of [`URL()`](constructor.md).

### Return value

A new `URL` when it can be parsed, `null` when not. The return value may be `null`; check for it before use.

### Exceptions

None.

## Examples

```js
const parsed = URL.parse('https://a.com/x');
if (parsed) {
  console.log(parsed.pathname);
}
console.log(URL.parse('/x'));
```

**Result**: Logs `/x`, then `null`.

## Differences from the web

Returns `null` for a relative address without a base; for the reason, see [`URL()`](constructor.md).

## See also

- [`URL.canParse()`](canparse.md): only check, without the result
