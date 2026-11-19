---
type: reference
native: NSLocale.regionCode
---

# `NSLocale`: `regionCode` property

The **`regionCode`** property is this locale's country or region code.

## Value

A string or `null`. The string is an ISO 3166 code, such as `'DE'` or `'CN'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- It is `null` when the identifier contains no country or region: `new NSLocale('fr')` reads `null`.
- On the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China), `NSLocale.currentLocale` reads `'CN'`, which is the region the user chose in Settings.

## Examples

```js
console.log(NSLocale.currentLocale.regionCode);
```

**Result**: prints `CN` on the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China).

## Corresponding iOS API

`NSLocale.regionCode`. The old name `countryCode` is not provided; its value is the same.

## See also

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForCountryCode()`](localizedstringforcountrycode.md)
