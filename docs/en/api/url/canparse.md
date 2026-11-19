---
type: reference
web: URL.canParse()
---

# `URL.canParse()` static method

The **`URL.canParse()`** static method determines whether text can be parsed as an address. It does not throw.

## Syntax

```
URL.canParse(url[, base])
```

### Parameters

**`url`**

Address text, or a `URL`.

**`base`**

Optional. The base for resolving a relative address. Same as the `base` of [`URL()`](constructor.md).

### Return value

A boolean. `true` if it can be parsed, `false` if not.

### Exceptions

None.

## Examples

```js
console.log(URL.canParse('/x'));
console.log(URL.canParse('https://a.com/x'));
console.log(URL.canParse('/x', 'https://a.com'));
```

**Result**: Logs `false`, `true`, `true` in order. The third line is **not verified in the simulator**.

## Differences from the web

Returns `false` for a relative address without a base; for the reason, see [`URL()`](constructor.md).

## See also

- [`URL.parse()`](parse.md): get the result directly when it can be parsed
