---
type: reference
---

# `Number.prototype.toLocaleString()` method

The **`toLocaleString()`** method writes a number as text by locale. It's equivalent to `new Intl.NumberFormat(locales, options).format(theNumber)`. `BigInt.prototype.toLocaleString()` is the same.

## Syntax

```
toLocaleString()
toLocaleString(locales)
toLocaleString(locales, options)
```

### Parameters

**`locales`** <small>optional</small>

Same as for the [`Intl.NumberFormat()`](constructor.md) constructor.

**`options`** <small>optional</small>

Same as for the [`Intl.NumberFormat()`](constructor.md) constructor.

### Return value

A string.

### Exceptions

Same as for the [`Intl.NumberFormat()`](constructor.md#exceptions) constructor.

## Description

The `toLocaleString()` of arrays and typed arrays passes these two arguments to each member. Members are always joined with an ASCII comma, which can't be told apart from a comma used as a decimal separator, so don't build lists for people this way; format each item yourself and join them.

When formatting a set of numbers repeatedly, create one `Intl.NumberFormat` and reuse it, rather than calling `toLocaleString()` with options for each number.

## Examples

### One number

```js
console.log((1234567.891).toLocaleString('de-DE'));
console.log((1234.5).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
```

**Result**: the console prints `1.234.567,891` and `$1,234.50`.

### Arrays

```js
console.log([1234.5, 0.5].toLocaleString('de-DE'));
```

**Result**: the console prints `1.234,5,0,5`.

## Differences from the web

The same differences as for `Intl.NumberFormat`; see [`Intl.NumberFormat`](../intl.md#differences-from-the-web).

## See also

- [`format()`](format.md)
