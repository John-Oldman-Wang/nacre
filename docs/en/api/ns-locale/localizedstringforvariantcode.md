---
type: reference
native: "-[NSLocale localizedStringForVariantCode:]"
---

# `NSLocale`: `localizedStringForVariantCode()` method

The **`localizedStringForVariantCode()`** method gives the name of a variant code in this locale's language.

## Syntax

```
localizedStringForVariantCode(variantCode)
```

## Parameters

**`variantCode`**

A variant code, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language. May be `null` when the code is not recognized. **Which codes give `null` is not verified in the simulator.**

## Exceptions

None.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForVariantCode('POSIX'));
```

**Result**: prints a string or `null`. **The exact value is not recorded.**

## Corresponding iOS API

`-[NSLocale localizedStringForVariantCode:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`variantCode`](variantcode.md)
