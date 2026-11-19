---
type: reference
native: NSLocale.currencyCode
---

# `NSLocale`: `currencyCode` property

The **`currencyCode`** property is this locale's currency code.

## Value

A string or `null`. The string is an ISO 4217 code, such as `'EUR'` or `'CNY'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- `de_DE` reads `'EUR'`, `en_US` reads `'USD'`, and `zh_Hans_CN` reads `'CNY'`. On the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China), `NSLocale.currentLocale` reads `'CNY'`.
- It is `null` when there is no currency. Which locales have no currency is **not verified in the simulator**.

To write an amount for the user's region, pass it to the `currency` option of `Intl.NumberFormat`.

## Examples

```js
const code = NSLocale.currentLocale.currencyCode;
if (code !== null) {
  console.log(new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(1234.5));
}
```

**Result**: On the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China), prints an amount in yuan written for the preferred language, such as `¥1,234.50`. **The format of this output is not verified in the simulator.**

## Corresponding iOS API

`NSLocale.currencyCode`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`Intl.NumberFormat`](../intl.md)
- [`localizedStringForCurrencyCode()`](localizedstringforcurrencycode.md)
