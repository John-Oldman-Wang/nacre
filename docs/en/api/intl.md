---
type: reference
status: partial
---

# `Intl.NumberFormat`

**`Intl.NumberFormat`** represents a formatting object that writes numbers as text according to the conventions of a region. It can write plain numbers, currency amounts, and percentages. The same number 1234567.891 is written `1,234,567.891` in the US, `1.234.567,891` in Germany, and `12,34,567.891` in India.

`Intl` is ECMAScript's internationalization API. There are two classes here:

- **`Intl.NumberFormat`**: numbers, currency amounts, percentages. `Number.prototype.toLocaleString()` and `BigInt.prototype.toLocaleString()` use it. This page covers it.
- **[`Intl.DateTimeFormat`](intl-date.md)**: dates and times. The three `toLocale*String()` methods of `Date` use it.

**It's written exactly as in the browser**, implemented according to the standard (ECMA-402). If you already know `Intl.NumberFormat` in the browser, write it the same way.

For how to display currency amounts, percentages, price changes, and large numbers, see the guide [Formatting numbers and currency by locale](../guides/format-numbers.md).

**Inheritance**: `Intl.NumberFormat`

## Constructor

[`Intl.NumberFormat()`](intl/constructor.md)

Creates a formatting object with the given locale and options. It can't be changed after creation.

## Static methods

| Method | Description |
| --- | --- |
| [`Intl.NumberFormat.supportedLocalesOf()`](intl/supportedlocalesof.md) | Picks out the given locales for which the system has data |

## Instance methods

| Method | Description |
| --- | --- |
| [`format()`](intl/format.md) | Writes a value as text. Already bound to this object, so it can be taken out and used on its own |
| [`resolvedOptions()`](intl/resolvedoptions.md) | The locale and options actually used, with defaults filled in |
| [`formatToParts()`](intl/formattoparts.md) | Throws `TypeError` when called |
| [`formatRange()`](intl/formatrange.md) | Throws `TypeError` when called |
| [`formatRangeToParts()`](intl/formatrangetoparts.md) | Throws `TypeError` when called |

## Related functions

The following aren't members of `Intl.NumberFormat`, but they use the same locale data, so they're described here together.

| Function | Description |
| --- | --- |
| [`Intl.getCanonicalLocales()`](intl/getcanonicallocales.md) | Changes locale tags to canonical casing |
| [`Number.prototype.toLocaleString()`](intl/tolocalestring.md) | Writes a number as text by locale. The `BigInt` method of the same name is identical |
| [`String.prototype.normalize()`](intl/normalize.md) | Converts a string to a Unicode normalization form |

## Do results match the browser?

**When a locale is specified, results match Safari on the same device item for item.** The locale data (which separators to use, how currency symbols are written) comes from iOS, and Safari uses the same data.

**When no locale is specified, results may differ from Safari**: the two choose the locale differently; see [Which locale is used when none is specified](#which-locale-is-used-when-none-is-specified).

Results aren't guaranteed to match Chrome character for character. Chrome ships its own locale data; for example, for Swiss German thousands separators Safari uses `'` and Chrome uses `’`. How options are parsed, what the defaults are, and which cases throw are the same in all three.

So don't treat formatted results as fixed strings to compare or parse. To compare values, compare the numbers themselves.

## Locale tags

A locale is represented by a string called a locale tag, such as `'en-US'`, `'zh-CN'`, or `'de-CH'`. The first part is the language and the second is the country or region.

- Case-insensitive: `'EN-us'` is the same as `'en-US'`.
- Use hyphens, not underscores. `'en_US'` throws `RangeError`.
- When the system has no data for a locale, it drops parts from the end one at a time and looks again. `'en-ZZ'` is treated as `'en'`. When the whole language is missing (`'xx'`), the system's preferred language is used, without an error.
- You can pass an array; the first one the system has is used: `new Intl.NumberFormat(['xx', 'de-DE'])` uses `de-DE`.
- Read which locale was actually used from `locale` in [`resolvedOptions()`](intl/resolvedoptions.md).

## Which locale is used when none is specified

The system's preferred language is used: the language listed first in Settings → General → Language & Region, together with its region.

```js
console.log(new Intl.NumberFormat().resolvedOptions().locale);
```

**Result**: when the system language is Simplified Chinese and the region is mainland China, the console prints `zh-CN`; with Simplified Chinese and the region Hong Kong, it prints `zh-Hans-HK`; with German and the region Austria, it prints `de-AT`.

> **Note:** This differs from Safari. Web pages in Safari don't get the system language itself: the browser first maps it to one of a few common languages so that websites can't identify the user by their language settings. So on the same phone, a web page's result without a specified locale may differ from the result here:
>
> | System preferred language | Here | Web page in Safari |
> | --- | --- | --- |
> | Simplified Chinese (Hong Kong) | `zh-Hans-HK` | `zh-CN` |
> | German (Austria) | `de-AT` | `de-DE` |
> | French (Switzerland) | `fr-CH` | `fr-FR` |
> | English (Ireland) | `en-IE` | `en-GB` |
> | Japanese (Japan) | `ja-JP` | `ja` |
>
> Here, the region the user actually chose is followed. For example, Austrian German writes currency amounts differently from German German; if the user chose Austria, amounts are written the Austrian way. When the language and region agree (Simplified Chinese with mainland China, English with the US), both give the same result.

## Unsupported options

**When an unsupported option is used, constructing `Intl.NumberFormat` throws `RangeError`**, and the error message names the option:

```
RangeError: notation: "engineering" is not supported by this runtime
```

Unsupported options are listed on the [constructor](intl/constructor.md#unsupported-options) page. They're never silently ignored.

TypeScript's built-in types consider all these options valid, so type checking can't catch them; only the runtime throws.

## Options are read only once, at construction

An `Intl.NumberFormat` can't be changed after creation. To use a different format, create another one. `resolvedOptions()` returns a new object each time; changing it doesn't affect formatting.

## Examples

```js
const price = 1234.5;

// 1. Write a number using the system's locale
console.log(price.toLocaleString());

// 2. Write it as currency. The locale decides the format; currency decides which currency
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log(usd.format(price));

// 3. The same formatting object can be reused
console.log([19.99, 5, 1200].map(usd.format).join(' / '));

// 4. Write it as a percentage
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
console.log(percent.format(0.256));

// 5. Write a large number in compact form
console.log(new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(1234567.891));
```

**Result**: when the system language is Simplified Chinese, the console prints, in order:

```
1,234.5
$1,234.50
$19.99 / $5.00 / $1,200.00
25.6%
123万
```

This code hasn't been run as a whole in the simulator. Each kind of call in it has been compared against a web page in the acceptance tests.

## Differences from the web

| Case | Browser | Here |
| --- | --- | --- |
| Which locale is used when none is specified | Safari maps the system language to one of a few common languages | Uses the system's preferred language itself; see [Which locale is used when none is specified](#which-locale-is-used-when-none-is-specified) |
| Every character of the result | Each browser has its own locale data | When a locale is specified, matches Safari on the same device item for item |
| Some options | Supported | Constructing throws `RangeError`; see [Unsupported options](intl/constructor.md#unsupported-options) |
| `formatToParts()`, `formatRange()`, `formatRangeToParts()` | Available | Throw `TypeError` when called |
| Significant digits of `BigInt` and decimal strings | Unlimited | At most 38 digits; longer throws `RangeError` |

## See also

- [Formatting numbers and currency by locale](../guides/format-numbers.md): currency amounts, fixed decimal places, price changes, large numbers, very large integers
- [`Intl.DateTimeFormat`](intl-date.md): formatting dates and times
- [How the runtime works](how-it-works.md): which standard global objects exist and which don't
