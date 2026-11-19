---
type: reference
native: NSLocale.ISOCountryCodes
---

# `NSLocale.ISOCountryCodes` static property

The **`ISOCountryCodes`** static property is every ISO 3166 country and region code.

## Value

An array of strings.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- Each read returns a new array.
- It contains `'CN'`.

## Examples

```js
console.log(NSLocale.ISOCountryCodes.includes('CN'));
```

**Result**: prints `true`.

## Corresponding iOS API

`NSLocale.ISOCountryCodes` (a class property).

## See also

- [`NSLocale`](../ns-locale.md)
