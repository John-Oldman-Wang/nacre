---
type: reference
native: NSLocale.ISOLanguageCodes
---

# `NSLocale.ISOLanguageCodes` static property

The **`ISOLanguageCodes`** static property is every ISO 639 language code.

## Value

An array of strings.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- Each read returns a new array.
- It contains `'en'`.

## Examples

```js
console.log(NSLocale.ISOLanguageCodes.includes('en'));
```

**Result**: prints `true`.

## Corresponding iOS API

`NSLocale.ISOLanguageCodes` (a class property).

## See also

- [`NSLocale`](../ns-locale.md)
