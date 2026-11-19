---
type: reference
status: partial
---

# `Intl.DateTimeFormat`

**`Intl.DateTimeFormat`** represents a formatter that writes a moment in time as text, following the conventions of a given locale. The same moment is written `Jan 5, 2026 at 3:04 AM` in the United States, `2026年1月5日 03:04` in China, and `05.01.2026, 03:04` in Germany.

The `toLocaleString()`, `toLocaleDateString()`, and `toLocaleTimeString()` methods of `Date` use the same machinery.

The API is exactly the same as in the browser and is implemented according to the standard (ECMA-402). For the overall description of `Intl` (the rules for locale tags, which locale is used when none is specified, number formatting), see [`Intl.NumberFormat`](intl.md).

To learn how to display times in the user's locale and time zone, show only the time, or write a time range, see the guide [Formatting dates and times by locale](../guides/format-dates.md).

**Inheritance**: `Intl.DateTimeFormat`

## Constructor

[`Intl.DateTimeFormat()`](intl-date/constructor.md)

Creates a formatter for the given locale and options. It cannot be changed after it is created.

## Static methods

| Method | Description |
| --- | --- |
| [`Intl.DateTimeFormat.supportedLocalesOf()`](intl-date/supportedlocalesof.md) | Picks out the given locales that the system has data for |

## Instance methods

| Method | Description |
| --- | --- |
| [`format()`](intl-date/format.md) | Writes a moment as text. Already bound to this object, so it can be taken out and used on its own |
| [`formatToParts()`](intl-date/formattoparts.md) | Returns the result piece by piece |
| [`formatRange()`](intl-date/formatrange.md) | Writes a time range, writing the parts the two ends share only once |
| [`resolvedOptions()`](intl-date/resolvedoptions.md) | The locale, calendar, time zone, and fields actually used |
| [`formatRangeToParts()`](intl-date/formatrangetoparts.md) | Throws `TypeError` when called |

## Related functions

The three `Date` methods use the same machinery and take the same arguments as the `Intl.DateTimeFormat` constructor:

| Function | Description |
| --- | --- |
| [`Date.prototype.toLocaleString()`](intl-date/tolocalestring.md) | Date and time |
| [`Date.prototype.toLocaleDateString()`](intl-date/tolocaledatestring.md) | Date only |
| [`Date.prototype.toLocaleTimeString()`](intl-date/tolocaletimestring.md) | Time only |

## Do the results match the browser?

**They are identical, call by call, to Safari on the same device.** The acceptance tests run more than forty thousand calls both in a web page and in the runtime on the same device and compare them one by one.

**The differences from Chrome are larger than for numbers.** Measured on the same set of calls, 21.4% of the results differ. For example, between the date and the time Safari writes `Jan 5, 2026 at 3:04 AM` and Chrome writes `Jan 5, 2026, 3:04 AM`. The meaning of the options, the defaults, and the cases that throw are the same in both.

So don't parse formatted strings, and don't compare them with hard-coded strings. For times that are sent to a server or stored, use `toISOString()` or a number of milliseconds.

## Time zones

A `Date` object represents a moment in time and carries no time zone. Which time zone is used when writing it as text is decided by the `timeZone` option:

- **Omitted**: the device's current time zone is used. Times shown to the user usually omit it.
- **A time zone name**: `'Asia/Shanghai'`, `'America/New_York'`, `'UTC'`. The names are those of the IANA time zone database and are case-insensitive.
- **A fixed offset**: `'+08:00'`, `'-05:30'`.

`'PST'`, `'UTC+8'`, and `'GMT+8'` are not valid and throw `RangeError`.

The same moment can fall on different dates in different time zones: 3 a.m. on January 5 in UTC is 10 p.m. on January 4 in New York.

## Two ways to choose: an overall style, or individual fields

**An overall style**: `dateStyle` and `timeStyle`, each with four levels: `'full'`, `'long'`, `'medium'`, and `'short'`. The result is written the way the locale customarily writes it, including the order of the fields and the punctuation between them. Giving only one of them writes only the date or only the time.

**Individual fields**: `year`, `month`, `day`, `weekday`, `hour`, `minute`, `second`, and so on. You only say which fields you want and how wide each is; the order of the fields and the punctuation between them are still decided by the locale.

The two can't be mixed; giving both throws `TypeError`. **Prefer an overall style**: it never produces a combination the locale isn't used to. Pick individual fields only when no style has the combination you want (for example, only the month and day).

When neither is given, the result is the year, month, and day in numeric form: `1/5/2026`.

## Examples

```js
// 2026-01-05 03:04:05 UTC
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));

// 1. An overall style. The time zone is fixed here, so the result doesn't vary with the device
const medium = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
});
console.log(medium.format(moment));

// 2. The same moment in a different time zone
const newYork = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York',
});
console.log(newYork.format(moment));

// 3. A different locale
console.log(new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
}).format(moment));

// 4. Individual fields: only the month and day
console.log(new Intl.DateTimeFormat('zh-CN', {
  month: 'short', day: 'numeric', timeZone: 'UTC',
}).format(moment));

// 5. Date's own methods use the same machinery
console.log(moment.toLocaleDateString('de-DE', { timeZone: 'UTC' }));
```

**Result**: the console prints, in order:

```
Jan 5, 2026 at 3:04 AM
Jan 4, 2026 at 10:04 PM
2026年1月5日 03:04
1月5日
5.1.2026
```

This code has not been run as a whole in the simulator. Each kind of call in it has been compared against a web page in the acceptance tests.

## Differences from the web

| Case | Browser | Here |
| --- | --- | --- |
| Every character of the result | Each browser has its own locale data | Identical, call by call, to Safari on the same device |
| Which locale is used when none is specified | Safari replaces the system language with one of a few common languages | The system's preferred language itself is used; see [Which locale is used when none is specified](intl.md#which-locale-is-used-when-none-is-specified) |
| `formatRangeToParts()` | Available | Throws `TypeError` when called |

## See also

- [Formatting dates and times by locale](../guides/format-dates.md): following the user's locale and time zone, the 24-hour clock, the day of the week, time zone names, time ranges, splitting the result to style it
- [`Intl.NumberFormat`](intl.md): number formatting, the rules for locale tags, and how closely the results match the browser
