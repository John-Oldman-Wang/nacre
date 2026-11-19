---
type: reference
---

# `Intl.DateTimeFormat`: `format()` method

The **`format()`** method writes a moment as text, using this formatter's locale, time zone, and options.

## Syntax

```
format()
format(date)
```

`format` is already bound to this object, so it can be taken out and used on its own, for example passed directly to `map`.

### Parameters

**`date`** <small>optional</small>

A `Date` object, or a number of milliseconds. When omitted, the current moment. Strings are not parsed as dates: call `new Date(...)` first.

### Return value

A string.

### Exceptions

**`RangeError`**

`date` is an invalid date (`new Date(NaN)`), or a value that can't be converted to a number, such as `format('2026-11-15')`: `date value is not finite in DateTimeFormat format()`.

## Examples

### A single moment

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
const clock = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: false, timeZone: 'UTC',
});
console.log(clock.format(moment));
```

**Result**: the console prints `03:04`.

### Passing it to `map`

```js
const times = [0, 86400000];
const day = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeZone: 'UTC' });
console.log(times.map(day.format).join(' / '));
```

**Result**: the console prints `1/1/70 / 1/2/70`. **This output is not verified in the simulator**; taking `format` out and passing it to `map`, and giving it milliseconds, have been compared against a web page in the acceptance tests.

## Differences from the web

Same as on the web. Every character of the result is the same as in Safari on the same device.

## See also

- [`formatToParts()`](formattoparts.md): returns the result split into pieces
- [`Date.prototype.toLocaleString()`](tolocalestring.md): the one-off form
