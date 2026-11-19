---
type: reference
native: NSLocale.ISOCurrencyCodes
---

# `NSLocale.ISOCurrencyCodes` static property

The **`ISOCurrencyCodes`** static property is every ISO 4217 currency code.

## Value

An array of strings.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- Each read returns a new array.
- It contains `'CNY'`.

## Examples

```js
console.log(NSLocale.ISOCurrencyCodes.includes('CNY'));
```

**Result**: prints `true`.

## Corresponding iOS API

`NSLocale.ISOCurrencyCodes` (a class property).

## See also

- [`NSLocale`](../ns-locale.md)
