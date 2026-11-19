---
type: reference
---

# `Intl.DateTimeFormat()` constructor

The **`Intl.DateTimeFormat()`** constructor creates a date and time formatter for the given locale and options.

## Syntax

```
new Intl.DateTimeFormat()
new Intl.DateTimeFormat(locales)
new Intl.DateTimeFormat(locales, options)
```

Calling it without `new` has the same effect. The formatter cannot be changed after it is created.

### Parameters

**`locales`** <small>optional</small>

A locale tag, or an array of locale tags. When omitted, the system's preferred language is used. For the rules, see [Locale tags](../intl.md#locale-tags).

**`options`** <small>optional</small>

An object with the members in the table below. An overall style (`dateStyle`, `timeStyle`) and individual fields can't be given together; see [Two ways to choose](../intl-date.md#two-ways-to-choose-an-overall-style-or-individual-fields).

| Option | Values | Meaning |
| --- | --- | --- |
| `dateStyle` | `'full'`, `'long'`, `'medium'`, `'short'` | The overall style of the date part, from most to least detailed. In `en-US` these are `Monday, January 5, 2026`, `January 5, 2026`, `Jan 5, 2026`, and `1/5/26` |
| `timeStyle` | Same as above | The overall style of the time part. In `en-US`, `'short'` is `3:04 AM`, `'medium'` is `3:04:05 AM`, and `'long'` and `'full'` include the time zone |
| `weekday` | `'long'`, `'short'`, `'narrow'` | The day of the week. `Monday`, `Mon`, `M` |
| `era` | `'long'`, `'short'`, `'narrow'` | The era. `'short'` is `AD` |
| `year` | `'numeric'`, `'2-digit'` | The year. `2026`, `26` |
| `month` | `'numeric'`, `'2-digit'`, `'long'`, `'short'`, `'narrow'` | The month. `1`, `01`, `January`, `Jan`, `J` |
| `day` | `'numeric'`, `'2-digit'` | The day. `5`, `05` |
| `hour` | `'numeric'`, `'2-digit'` | The hour |
| `minute` | `'numeric'`, `'2-digit'` | The minute |
| `second` | `'numeric'`, `'2-digit'` | The second |
| `fractionalSecondDigits` | `1`, `2`, `3` | How many fractional digits of the second to write; a number of digits |
| `dayPeriod` | `'long'`, `'short'`, `'narrow'` | Writes the period of the day instead of AM and PM. In `en-US`, 3 o'clock is `3 in the morning` |
| `timeZoneName` | `'short'`, `'long'`, `'shortOffset'`, `'longOffset'`, `'shortGeneric'`, `'longGeneric'` | How the time zone is written. For New York in winter these are, in order, `EST`, `Eastern Standard Time`, `GMT-5`, `GMT-05:00`, `ET`, `Eastern Time`. **The examples for the last four are not verified in the simulator**; each of the six values has been compared against a web page in the acceptance tests |
| `hour12` | Boolean | `true`: 12-hour clock. `false`: 24-hour clock. Omitted: the locale's convention |
| `hourCycle` | `'h11'`, `'h12'`, `'h23'`, `'h24'` | A finer-grained hour cycle: whether the day is counted from 0 or 1, and whether it counts up to 11, 12, 23, or 24. It has no effect when `hour12` is given |
| `timeZone` | A time zone name or offset; see [Time zones](../intl-date.md#time-zones) | Which time zone to use. When omitted, the device's current time zone |
| `calendar` | `'gregory'`, `'chinese'`, `'japanese'`, `'buddhist'`, `'persian'`, `'islamic-umalqura'`, and so on | Which calendar to use. When omitted, the locale's default calendar (the Buddhist calendar in Thailand) |
| `numberingSystem` | `'latn'`, `'arab'`, and so on | Which set of digits to use |
| `localeMatcher`, `formatMatcher` | The values defined by the standard | Only the values are checked; they don't affect the result |

- When no field and no style is given, it behaves as if `year`, `month`, and `day` were all `'numeric'`.
- **`'numeric'` doesn't guarantee one digit; `'2-digit'` guarantees two.** This is especially true of `'numeric'` for the hour: in `zh-CN`, `hour: 'numeric'` with `minute: '2-digit'` gives `3:04`, while `hour: 'numeric'` with `minute: 'numeric'` gives `03:04`. This is decided by the system's locale data, and Safari behaves the same way. To always get two digits, write `'2-digit'`.
- When the minute and second are `'numeric'`, they are still two digits when they appear with other fields (`3:04`); they are one digit only when they appear alone.

### Return value

A new `Intl.DateTimeFormat`.

### Exceptions

**`RangeError`**

- An option has a value outside its allowed range.
- `timeZone` isn't recognized: `invalid time zone: PST`, ending with the value given.
- `locales` isn't a valid locale tag: `invalid language tag: en_US`.

**`TypeError`**

- `dateStyle` or `timeStyle` is given together with an individual field option: `dateStyle and timeStyle may not be used with other DateTimeFormat options`.
- `options` is `null`: `options must be an object, got null`.
- `locales` is `null`: `locales must be a string or an array, got null`.

## Examples

### An overall style

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
const medium = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
});
console.log(medium.format(moment));
```

**Result**: the console prints `Jan 5, 2026 at 3:04 AM`.

### Individual fields

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
console.log(new Intl.DateTimeFormat('zh-CN', {
  month: 'short', day: 'numeric', timeZone: 'UTC',
}).format(moment));
```

**Result**: the console prints `1月5日`.

### An invalid time zone

```js
try {
  new Intl.DateTimeFormat('en-US', { timeZone: 'PST' });
} catch (err) {
  console.log(String(err));
}
```

**Result**: prints `RangeError: invalid time zone: PST`.

## Differences from the web

When `locales` is omitted, the system's preferred language itself is used here; web pages in Safari first replace it with one of a few common languages. See [Which locale is used when none is specified](../intl.md#which-locale-is-used-when-none-is-specified). Everything else is the same as on the web.

## See also

- [`format()`](format.md)
- [`resolvedOptions()`](resolvedoptions.md): reading back the options actually used
- [Formatting dates and times by locale](../../guides/format-dates.md)
