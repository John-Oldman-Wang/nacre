---
type: reference
native: NSLocale.commonISOCurrencyCodes
---

# `NSLocale.commonISOCurrencyCodes` static property

The **`commonISOCurrencyCodes`** static property is the commonly used currency codes.

## Value

An array of strings.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- Each read returns a new array.
- It contains `'USD'`.

## Examples

```js
console.log(NSLocale.commonISOCurrencyCodes.includes('USD'));
```

**Result**: prints `true`.

## Corresponding iOS API

`NSLocale.commonISOCurrencyCodes` (a class property).

## See also

- [`NSLocale`](../ns-locale.md)
