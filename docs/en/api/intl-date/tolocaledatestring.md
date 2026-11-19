---
type: reference
---

# `Date.prototype.toLocaleDateString()` method

The **`toLocaleDateString()`** method writes a `Date` as text according to a locale. It uses the same machinery as [`Intl.DateTimeFormat`](../intl-date.md); when no fields or styles are given, it writes only the date.

## Syntax

```
toLocaleDateString()
toLocaleDateString(locales)
toLocaleDateString(locales, options)
```

### Parameters

**`locales`** <small>optional</small>

Same as for the [`Intl.DateTimeFormat()`](constructor.md) constructor.

**`options`** <small>optional</small>

Same as for the [`Intl.DateTimeFormat()`](constructor.md) constructor. `timeStyle` is not accepted.

### Return value

A string. An invalid date doesn't throw; it returns `'Invalid Date'`.

### Exceptions

Same as for the [`Intl.DateTimeFormat()`](constructor.md#exceptions) constructor.

In addition, giving `timeStyle` in `options` throws `TypeError: timeStyle is specified while formatting date is requested`.

## Default output of the three methods

| Method | When no fields or styles are given | `en-US` example |
| --- | --- | --- |
| [`toLocaleString()`](tolocalestring.md) | Date and time | `11/15/2026, 3:05:09 PM` |
| [`toLocaleDateString()`](tolocaledatestring.md) | Date only | `11/15/2026` |
| [`toLocaleTimeString()`](tolocaletimestring.md) | Time only | `3:05:09 PM` |

## Examples

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
console.log(moment.toLocaleDateString('de-DE', { timeZone: 'UTC' }));
```

**Result**: the console prints `5.1.2026`.

## Differences from the web

The same as the differences for `Intl.DateTimeFormat`; see [`Intl.DateTimeFormat`](../intl-date.md#differences-from-the-web).

## See also

- [Displaying in the user's locale and time zone](../../guides/format-dates.md#displaying-in-the-users-region-and-time-zone)
