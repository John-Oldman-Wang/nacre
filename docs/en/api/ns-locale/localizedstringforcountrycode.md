---
type: reference
native: "-[NSLocale localizedStringForCountryCode:]"
---

# `NSLocale`: `localizedStringForCountryCode()` method

The **`localizedStringForCountryCode()`** method gives the name of a country or region code in this locale's language.

## Syntax

```
localizedStringForCountryCode(countryCode)
```

## Parameters

**`countryCode`**

A country or region code, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language. May be `null` when the code is not recognized. **Which codes give `null` is not verified in the simulator.**

## Exceptions

None.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForCountryCode('JP'));
```

**Result**: prints `Japan`.

## Corresponding iOS API

`-[NSLocale localizedStringForCountryCode:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`regionCode`](regioncode.md)
