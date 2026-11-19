---
type: reference
---

# `Intl.DateTimeFormat`: `formatRange()` method

The **`formatRange()`** method writes a time range. The parts the two ends share are written only once.

## Syntax

```
formatRange(startDate, endDate)
```

### Parameters

**`startDate`**

The start, a `Date` object or a number of milliseconds. Required.

**`endDate`**

The end, a `Date` object or a number of milliseconds. Required. When the start is later than the end, they are not swapped; they are written as given.

### Return value

A string.

- The separator in the middle is an en dash (U+2013) with one space on each side.
- When the two ends are indistinguishable in this format (two moments on the same day, with only the date written), the output is a single date.

### Exceptions

**`TypeError`**

An argument is missing: `formatRange needs a start date and an end date`.

**`RangeError`**

One of them is an invalid date: `Passed date is out of range`.

## Examples

```js
const from = new Date(Date.UTC(2026, 10, 15, 8));
const to = new Date(Date.UTC(2026, 10, 18, 8));
const range = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
console.log(range.formatRange(from, to));
console.log(range.formatRange(from, from));
```

**Result**: the console prints `Nov 15 – 18, 2026` and `Nov 15, 2026`.

## Differences from the web

Same as on the web.

## See also

- [`formatRangeToParts()`](formatrangetoparts.md): not available yet
