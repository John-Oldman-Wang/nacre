---
type: reference
---

# `Intl.NumberFormat()` constructor

The **`Intl.NumberFormat()`** constructor creates a number formatting object with the given locale and options.

## Syntax

```
new Intl.NumberFormat()
new Intl.NumberFormat(locales)
new Intl.NumberFormat(locales, options)
```

Calling it directly without `new` has the same effect.

### Parameters

**`locales`** <small>optional</small>

A locale tag, or an array of locale tags. If omitted, the system's preferred language is used. For the rules, see [Locale tags](../intl.md#locale-tags).

**`options`** <small>optional</small>

An object with the members in the table below. If omitted, all defaults are used. It's read only once, at construction; changing the object afterwards doesn't affect formatting.

| Option | Values | Default | Meaning |
| --- | --- | --- | --- |
| `style` | `'decimal'`, `'percent'`, `'currency'` | `'decimal'` | Whether to write a plain number, a percentage, or a currency amount. `'percent'` multiplies the number by 100: `0.256` is written `26%` |
| `currency` | A three-letter currency code, such as `'USD'` | None | Which currency. Required when `style` is `'currency'`. Case-insensitive |
| `currencyDisplay` | `'symbol'`, `'narrowSymbol'`, `'code'`, `'name'` | `'symbol'` | How the currency is written. For US dollars under `en-US`, these give `$1,234.50`, `$1,234.50`, `USD 1,234.50`, and `1,234.50 US dollars`. In other locales `'symbol'` includes the country (`US$` under `zh-CN`); `'narrowSymbol'` doesn't |
| `currencySign` | `'standard'`, `'accounting'` | `'standard'` | `'accounting'`: negative amounts use parentheses; `-1234.5` is written `($1,234.50)` |
| `notation` | `'standard'`, `'compact'`, `'scientific'` | `'standard'` | `'compact'`: `1.2M`. `'scientific'`: `1.235E6` |
| `signDisplay` | `'auto'`, `'always'`, `'exceptZero'`, `'never'`, `'negative'` | `'auto'` | The plus/minus sign. `'auto'`: only negative numbers have one. `'always'`: all do, and `0` is written `+0`. `'exceptZero'`: all except 0. `'never'`: none. `'negative'`: only negative numbers, excluding negatives that round to 0 |
| `useGrouping` | `'auto'`, `'always'`, `'min2'`, `true`, `false` | `'auto'`; `'min2'` in compact notation | Thousands separators. `'auto'`: follows the locale's convention; Spanish doesn't group four-digit numbers, so `1234` stays `1234`. `'always'` and `true`: always group, `1.234`. `'min2'`: four-digit numbers aren't grouped; grouping starts at five digits. `false`: no grouping |
| `minimumIntegerDigits` | An integer from 1 to 21, a digit count | `1` | The minimum number of integer digits, padded with leading zeros. With `3`, `1` is written `001` |
| `minimumFractionDigits` | An integer from 0 to 100, a digit count | `0` for plain numbers and percentages; depends on the currency for amounts | The minimum number of fraction digits, padded with zeros |
| `maximumFractionDigits` | An integer from 0 to 100, a digit count | `3` for plain numbers, `0` for percentages; depends on the currency for amounts | The maximum number of fraction digits; extra digits are rounded |
| `minimumSignificantDigits` | An integer from 1 to 21, a digit count | `1` | The minimum number of significant digits. When significant-digit options are given, the fraction-digit options have no effect |
| `maximumSignificantDigits` | An integer from 1 to 21, a digit count | `21` | The maximum number of significant digits. With `3`, `1234567.891` is written `1,230,000` |
| `roundingMode` | `'halfExpand'`, `'halfEven'`, `'ceil'`, `'floor'`, `'expand'`, `'trunc'` | `'halfExpand'` | How to round. `'halfExpand'`: round half away from zero. `'halfEven'`: when exactly halfway, round to even; `2.5` becomes `2`. `'ceil'`: toward larger values. `'floor'`: toward smaller values. `'expand'`: away from zero. `'trunc'`: just truncate |
| `roundingIncrement` | 15 values such as 1, 2, 5, 10, 20, 25, 50, 100 | `1` | Rounds the last fraction digit to a multiple of this. With two decimal places and `5`, the last digit of the result is only ever 0 or 5. Requires `minimumFractionDigits` and `maximumFractionDigits` to be equal |
| `numberingSystem` | The name of a numbering system, such as `'latn'` or `'arab'` | The locale's default | Which set of digits to use. `'arab'`: `١٬٢٣٤٫٥` |
| `localeMatcher` | `'lookup'`, `'best fit'` | `'best fit'` | Only the value is checked; both have the same effect |

Numeric options that aren't integers are rounded down; `2.7` is treated as `2`. Strings are converted to numbers first; `'2'` is treated as `2`.

### Unsupported options

The following are in the standard but not available here. Using them makes the constructor throw `RangeError` with the message `<option>: "<value>" is not supported by this runtime`.

| Option | Unsupported values |
| --- | --- |
| `style` | `'unit'` |
| `notation` | `'engineering'` |
| `compactDisplay` | `'long'` (compact notation has only the short form) |
| `roundingMode` | `'halfTrunc'`, `'halfCeil'`, `'halfFloor'` |
| `roundingPriority` | `'morePrecision'`, `'lessPrecision'` |
| `trailingZeroDisplay` | `'stripIfInteger'` |
| `minimumIntegerDigits` | Greater than 1 while significant-digit options are also given |

TypeScript's built-in types consider all these options valid, so type checking can't catch them; only the runtime throws.

### Return value

A new `Intl.NumberFormat`.

### Exceptions

**`RangeError`**

- `locales` isn't a valid locale tag, such as `'en_US'`: `invalid language tag: en_US`.
- An option's value is outside the range defined by the standard, for example `notation has no value "tiny"; expected one of: standard / scientific / engineering / compact`.
- An [unsupported option](#unsupported-options) is used, for example `notation: "engineering" is not supported by this runtime`.

**`TypeError`**

- `locales` is `null`: `locales must be a string or an array, got null`. Also thrown when the array contains a non-string member.
- `options` is `null`: `options must be an object, got null`.
- `style` is `'currency'` but no `currency` is given: `currency is required when style is "currency"`.

## Examples

### Currency amounts

```js
const jpy = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
console.log(jpy.format(1234.5));
console.log(eur.format(1234.5));
```

**Result**: the console prints `¥1,235` and `1.234,50 €`. The number of decimal places is determined by the currency. In German there's a no-break space (U+00A0) between the amount and `€`.

### Using an unsupported option

```js
try {
  new Intl.NumberFormat('en-US', { notation: 'engineering' });
} catch (err) {
  console.log(String(err));
}
```

**Result**: prints `RangeError: notation: "engineering" is not supported by this runtime`.

## Differences from the web

- [Unsupported options](#unsupported-options) work in the browser; here, the constructor throws `RangeError`.
- When `locales` is omitted, the system's preferred language itself is used here; web pages in Safari first map it to one of a few common languages. See [Which locale is used when none is specified](../intl.md#which-locale-is-used-when-none-is-specified).
- Everything else (option parsing, defaults, error types) is the same as on the web.

## See also

- [`format()`](format.md)
- [`resolvedOptions()`](resolvedoptions.md): reading back the options actually used
- [Formatting numbers and currency by locale](../../guides/format-numbers.md)
