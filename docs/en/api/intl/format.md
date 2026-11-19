---
type: reference
---

# `Intl.NumberFormat`: `format()` method

The **`format()`** method writes a value as text according to this formatting object's locale and options.

## Syntax

```
format(value)
```

`format` is already bound to the object, so it can be taken out and used on its own, for example passed directly to `map`.

### Parameters

**`value`**

A number, a `BigInt`, or a string containing a number.

- Other values are converted with `Number()`: `null` becomes `0`, `undefined` and strings that can't be converted become `NaN`, and `true` becomes `1`.
- Strings in plain decimal notation (`'1234.5'`) are formatted digit for digit as written, without first becoming an ordinary number, so nothing is lost beyond 16 digits.

### Return value

A string.

- `NaN` is written `NaN`. `Infinity` is written `∞`. `-0` is written `-0`.
- Ordinary numbers have only about 16 significant digits; digits beyond that are lost the moment they're written in code. Use `BigInt` for integers longer than 16 digits.

### Exceptions

**`RangeError`**

A `BigInt` or decimal string has more than 38 significant digits: `numbers with more than 38 significant digits are not supported by this runtime`.

## Examples

### Several kinds of values

```js
const plain = new Intl.NumberFormat('en-US');
console.log(plain.format(1234567.891));
console.log(plain.format('1234.5'));
console.log(plain.format(NaN));
```

**Result**: the console prints `1,234,567.891`, `1,234.5`, and `NaN`.

### Passing it to `map`

```js
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log([19.99, 5, 1200].map(usd.format).join(' / '));
```

**Result**: the console prints `$19.99 / $5.00 / $1,200.00`.

### Very large integers

```js
console.log(new Intl.NumberFormat('en-US').format(12345678901234567890n));
```

**Result**: the console prints `12,345,678,901,234,567,890`.

## Differences from the web

`BigInt` and decimal strings are limited to 38 significant digits; browsers have no limit. Everything else is the same as on the web.

## See also

- [`Number.prototype.toLocaleString()`](tolocalestring.md): the one-off form
- [Constructor](constructor.md): options
