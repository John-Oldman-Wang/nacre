---
type: reference
native: NSLocale.variantCode
---

# `NSLocale`: `variantCode` property

The **`variantCode`** property is this locale's variant code.

## Value

A string or `null`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- It is `null` when the identifier contains no variant. `new NSLocale('en_US_POSIX')` reads `'POSIX'`.

## Examples

```js
console.log(new NSLocale('en_US_POSIX').variantCode);
```

**Result**: prints `POSIX`.

## Corresponding iOS API

`NSLocale.variantCode`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForVariantCode()`](localizedstringforvariantcode.md)
