---
type: reference
---

# `Date.prototype.toLocaleString()` method

The **`toLocaleString()`** method writes a `Date` as text according to a locale. It uses the same machinery as [`Intl.DateTimeFormat`](../intl-date.md); when no fields or styles are given, it writes the date and the time.

## Syntax

```
toLocaleString()
toLocaleString(locales)
toLocaleString(locales, options)
```

### Parameters

**`locales`** <small>optional</small>

Same as for the [`Intl.DateTimeFormat()`](constructor.md) constructor.

**`options`** <small>optional</small>

Same as for the [`Intl.DateTimeFormat()`](constructor.md) constructor.

### Return value

A string. An invalid date doesn't throw; it returns `'Invalid Date'`.

### Exceptions

Same as for the [`Intl.DateTimeFormat()`](constructor.md#exceptions) constructor.

## Default output of the three methods

| Method | When no fields or styles are given | `en-US` example |
| --- | --- | --- |
| [`toLocaleString()`](tolocalestring.md) | Date and time | `11/15/2026, 3:05:09 PM` |
| [`toLocaleDateString()`](tolocaledatestring.md) | Date only | `11/15/2026` |
| [`toLocaleTimeString()`](tolocaletimestring.md) | Time only | `3:05:09 PM` |

## Examples

```js
const moment = new Date(Date.UTC(2026, 10, 15, 15, 5, 9));
console.log(moment.toLocaleString('en-US', { timeZone: 'UTC' }));
console.log(new Date(NaN).toLocaleString());
```

**Result**: the console prints `11/15/2026, 3:05:09 PM` and `Invalid Date`. **These two outputs are not verified in the simulator**; this method without fields has been compared against a web page in the acceptance tests, using a different moment.

## Differences from the web

The same as the differences for `Intl.DateTimeFormat`; see [`Intl.DateTimeFormat`](../intl-date.md#differences-from-the-web).

## See also

- [Displaying in the user's locale and time zone](../../guides/format-dates.md#displaying-in-the-users-region-and-time-zone)
