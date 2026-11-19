# Formatting dates and times by locale

This guide covers how to use [`Intl.DateTimeFormat`](../api/intl-date.md) and `Date`'s `toLocale*String()` methods to display times according to the user's region and time zone, as well as showing only the time, showing the day of the week, and writing a span of time. The details of each option are on the page for the [`Intl.DateTimeFormat()`](../api/intl-date/constructor.md) constructor.

## Recommended approach

- **For times shown to the user, give neither a locale nor a time zone; follow the device.** Give `timeZone` only when you need to pin a specific time zone.
- **Prefer the whole-format styles `dateStyle` and `timeStyle`.** They never produce a combination the region is not used to. Pick fields one by one only when the styles do not offer the combination you want (for example, only "month and day"). See [Two ways to choose](../api/intl-date.md#two-ways-to-choose-an-overall-style-or-individual-fields).
- **To always get two digits, write `'2-digit'`.** `'numeric'` does not guarantee a single digit.
- **Do not parse formatted strings, and do not compare them with hard-coded strings.** For times sent to a server or stored, use `toISOString()` or milliseconds.
- **Use one formatter for a set of moments.** When formatting a set of moments repeatedly, create one `Intl.DateTimeFormat` and reuse it.

## First example

```js
// 2026-01-05 03:04:05 UTC
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));

// 1. A whole-format style. The time zone is fixed here, so the result does not vary by device
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

// 4. Field by field: only month and day
console.log(new Intl.DateTimeFormat('zh-CN', {
  month: 'short', day: 'numeric', timeZone: 'UTC',
}).format(moment));

// 5. Date's own methods use the same machinery
console.log(moment.toLocaleDateString('de-DE', { timeZone: 'UTC' }));
```

**Result**: The console prints, in order:

```
Jan 5, 2026 at 3:04 AM
Jan 4, 2026 at 10:04 PM
2026年1月5日 03:04
1月5日
5.1.2026
```

This code has not been run as a whole in the simulator. Each kind of call in it has been compared against a web browser in the acceptance tests.

The following sections all reuse the `moment` above.

## Displaying in the user's region and time zone

```js
console.log(moment.toLocaleString());
console.log(moment.toLocaleDateString());
console.log(moment.toLocaleTimeString());
```

**Result**: When the system language is Simplified Chinese and the time zone is China's, prints `2026/1/5 11:04:05`, `2026/1/5`, and `11:04:05`. **These three outputs are not verified in the simulator**; these three methods without arguments have been compared against a web browser in the acceptance tests, using a different moment.

Write times shown to the user this way: give neither a locale nor a time zone, and follow the device.

## What the four styles look like

```js
for (const style of /** @type {const} */ (['full', 'long', 'medium', 'short'])) {
  console.log(new Intl.DateTimeFormat('en-US', { dateStyle: style, timeZone: 'UTC' }).format(moment));
}
```

**Result**:

```
Monday, January 5, 2026
January 5, 2026
Jan 5, 2026
1/5/26
```

The same four styles in `zh-CN` are `2026年1月5日 星期一`, `2026年1月5日`, `2026年1月5日`, and `2026/1/5`. The level of detail for the same style is not exactly the same across regions.

## Showing only the time, in 24-hour format

```js
const clock = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: false, timeZone: 'UTC',
});
console.log(clock.format(moment));
```

**Result**: The console prints `03:04`.

Without `hour12`, the region's convention applies: `en-US` gives `3:04 AM` and `de-DE` gives `3:04`.

## Showing the day of the week

```js
console.log(new Intl.DateTimeFormat('zh-CN', { weekday: 'long', timeZone: 'UTC' }).format(moment));
console.log(new Intl.DateTimeFormat('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
}).format(moment));
```

**Result**: The console prints `星期一` and `Mon, Jan 5`.

## Including the time zone name

```js
console.log(new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: 'America/New_York',
}).format(moment));
```

**Result**: The console prints `10:04 PM EST`.

For the six forms of `timeZoneName`, see [the constructor](../api/intl-date/constructor.md).

## Writing a span of time

```js
const from = new Date(Date.UTC(2026, 10, 15, 8));
const to = new Date(Date.UTC(2026, 10, 18, 8));
const range = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
console.log(range.formatRange(from, to));
```

**Result**: The console prints `Nov 15 – 18, 2026`. The parts that are the same at both ends (the month and the year) are written only once.

- The separator in the middle is an en dash (U+2013), with one space on each side.
- When the two ends are indistinguishable in this format (two moments on the same day, with only the date written), the output is the single date `Nov 15, 2026`.

## Splitting the result to style each part

```js
const parts = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
  .formatToParts(moment);
console.log(parts.map((part) => part.type + '=' + part.value).join(' | '));
```

**Result**: The console prints `month=Jan | literal=  | day=5 | literal=,  | year=2026`.

Use it when you want to show the month and the day in different font sizes; do not slice the result of `format()` yourself, because the order of fields differs by region.

## One format for a list of times

```js
const times = [0, 86400000];
const day = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeZone: 'UTC' });
console.log(times.map(day.format).join(' / '));
```

**Result**: The console prints `1/1/70 / 1/2/70`. **This output is not verified in the simulator**; passing the extracted `format` to `map`, and giving it milliseconds, have been compared against a web browser in the acceptance tests.

`day.format` is an already-bound function and can be passed directly to `map`. It also accepts milliseconds.

## Finding the device's current time zone

```js
console.log(new Intl.DateTimeFormat().resolvedOptions().timeZone);
```

**Result**: Prints the device's current time zone name, such as `Asia/Shanghai`.

## See also

- [`Intl.DateTimeFormat`](../api/intl-date.md): time zones, the two ways to choose, and how closely it matches browsers
- [Formatting numbers and currency by locale](format-numbers.md)
