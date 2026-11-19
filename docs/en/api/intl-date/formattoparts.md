---
type: reference
---

# `Intl.DateTimeFormat`: `formatToParts()` method

The **`formatToParts()`** method returns the formatted result piece by piece, saying which field each piece is.

## Syntax

```
formatToParts()
formatToParts(date)
```

### Parameters

**`date`** <small>optional</small>

Same as for [`format()`](format.md).

### Return value

An array whose items are `{ type, value }`. Joining all the `value`s gives the result of `format()`.

The values of `type`: `'year'`, `'month'`, `'day'`, `'weekday'`, `'hour'`, `'minute'`, `'second'`, `'fractionalSecond'`, `'dayPeriod'` (AM, PM), `'era'`, `'timeZoneName'`, `'literal'` (punctuation and spaces between fields). Calendars such as the Chinese lunar calendar also have `'relatedYear'` and `'yearName'`.

### Exceptions

**`RangeError`**

`date` is an invalid date, or a value that can't be converted to a number: `date value is not finite in DateTimeFormat formatToParts()`.

## Examples

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
const parts = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
  .formatToParts(moment);
console.log(parts.map((part) => part.type + '=' + part.value).join(' | '));
```

**Result**: the console prints `month=Jan | literal=  | day=5 | literal=,  | year=2026`.

Use it when the month and the day should be shown at different font sizes, rather than slicing the result of `format()` yourself: the order of the fields differs between locales.

## Differences from the web

Same as on the web.

## See also

- [`format()`](format.md)
