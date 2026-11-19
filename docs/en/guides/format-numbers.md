# Formatting numbers and currency by locale

This guide shows how to use [`Intl.NumberFormat`](../api/intl.md) to display numbers, currency amounts, percentages, and large numbers in the user's locale. Details of each option are on the [`Intl.NumberFormat()`](../api/intl/constructor.md) constructor page.

## Recommended approach

- **Don't specify a locale for numbers shown to the user; let them follow the system.** Specify one only when you want a fixed format, for example to always show values from code in English format. For which locale is used when none is specified, see [Which locale is used when none is specified](../api/intl.md#which-locale-is-used-when-none-is-specified).
- **Use one formatter for a set of numbers.** When formatting a set of numbers repeatedly, create one `Intl.NumberFormat` and reuse it rather than calling `toLocaleString()` with options for each number.
- **Don't compare or parse formatted results as fixed strings.** Results may differ by a character across devices and system versions. To compare values, compare the numbers themselves.
- **Use `BigInt` for integers longer than 16 digits.** Ordinary numbers have only about 16 significant digits.

## First example

```js
const price = 1234.5;

// 1. Write the number in the system's locale
console.log(price.toLocaleString());

// 2. Write it as currency. The locale decides the format; currency decides which currency
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log(usd.format(price));

// 3. The same formatter can be reused
console.log([19.99, 5, 1200].map(usd.format).join(' / '));

// 4. Write it as a percentage
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
console.log(percent.format(0.256));

// 5. Write a large number in compact form
console.log(new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(1234567.891));
```

**Result**: When the system language is Simplified Chinese, the console prints in order:

```
1,234.5
$1,234.50
$19.99 / $5.00 / $1,200.00
25.6%
123万
```

This code has not been run as a whole in the simulator. Each kind of call in it has been compared against the web in the acceptance tests.

## Display currency amounts

```js
const jpy = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
console.log(jpy.format(1234.5));
console.log(eur.format(1234.5));
```

**Result**: The console prints `¥1,235` and `1.234,50 €`.

- The number of decimal places is determined by the currency: yen has none, dollars and euros have two. You don't need to write `maximumFractionDigits` yourself.
- Locale and currency are separate. `zh-CN` with `USD` gives `US$1,234.50`: the format is Chinese and the currency is US dollars.
- When `style` is `'currency'`, `currency` is required; otherwise a `TypeError` is thrown.
- In German, the separator between the amount and `€` is a no-break space (U+00A0), not an ordinary space.

## Fix the number of decimal places

```js
const fixed = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
console.log(fixed.format(1234.5));
console.log(fixed.format(1.005));
```

**Result**: The console prints `1,234.50` and `1.01`.

Rounding is round-half-up: values exactly halfway round away from zero. `2.5` with no decimal places is `3`, and `3.5` is `4`. To change the rule, use `roundingMode`; see [the constructor](../api/intl/constructor.md).

## Display price changes

```js
const change = new Intl.NumberFormat('en-US', {
  style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero',
});
console.log(change.format(0.0312));
console.log(change.format(-0.0105));
console.log(change.format(0));
```

**Result**: The console prints `+3.12%`, `-1.05%`, and `0%`. **These three outputs are not verified in the simulator**; the combination of `signDisplay: 'exceptZero'` with percentages has been compared against the web in the acceptance tests, using other values.

For the five values of `signDisplay`, see [the constructor](../api/intl/constructor.md).

## Shorten large numbers

```js
console.log(new Intl.NumberFormat('en-US', { notation: 'compact' }).format(1234567.891));
console.log(new Intl.NumberFormat('en-US', { notation: 'compact' }).format(12345));
console.log(new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(12345));
```

**Result**: The console prints `1.2M`, `12K`, and `1.2万`.

Compact notation keeps two significant digits by default. The units follow the locale: English uses thousands and millions; Chinese uses `万` (ten thousand) and `亿` (hundred million).

## No thousands separators

```js
console.log(new Intl.NumberFormat('en-US', { useGrouping: false }).format(1234567.891));
```

**Result**: The console prints `1234567.891`.

## Use the same format for a column of numbers

```js
const amounts = [19.99, 5, 1200];
const labels = amounts.map(usd.format);
console.log(labels.join(' / '));
```

This section reuses `usd` from the [First example](#first-example).

**Result**: The console prints `$19.99 / $5.00 / $1,200.00`.

`usd.format` is an already-bound function, so you can pass it directly to `map` instead of writing `(n) => usd.format(n)`.

## Format very large integers

```js
console.log(new Intl.NumberFormat('en-US').format(12345678901234567890n));
console.log(new Intl.NumberFormat('en-US').format(12345678901234567890));
```

**Result**: The first line prints `12,345,678,901,234,567,890`. The second line prints `12,345,678,901,234,567,000`: ordinary numbers have only about 16 significant digits, and the remaining digits are lost the moment they are written in code. **The second line's output is not verified in the simulator.**

Use `BigInt` (a number followed by `n`) for integers longer than 16 digits. `BigInt` supports at most 38 significant digits; longer ones throw `RangeError`.

## See also

- [`Intl.NumberFormat`](../api/intl.md): how closely it matches browsers, locale tags, unsupported options
- [Formatting dates and times by locale](format-dates.md)
