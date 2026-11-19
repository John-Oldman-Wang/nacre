---
type: reference
native: "-[NSLocale localizedStringForCurrencyCode:]"
---

# `NSLocale`: `localizedStringForCurrencyCode()` method

The **`localizedStringForCurrencyCode()`** method gives the name of a currency code in this locale's language.

## Syntax

```
localizedStringForCurrencyCode(currencyCode)
```

## Parameters

**`currencyCode`**

A currency code, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language. May be `null` when the code is not recognized. **Which codes give `null` is not verified in the simulator.**

## Exceptions

None.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForCurrencyCode('EUR'));
```

**Result**: prints `Euro`.

## Corresponding iOS API

`-[NSLocale localizedStringForCurrencyCode:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`currencyCode`](currencycode.md)
