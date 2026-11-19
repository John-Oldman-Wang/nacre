---
type: reference
native: NSLocale.calendarIdentifier
---

# `NSLocale`: `calendarIdentifier` property

The **`calendarIdentifier`** property is the calendar this locale uses.

## Value

A string, such as `'gregorian'` (the Gregorian calendar) or `'japanese'` (Japanese imperial eras).

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- A calendar specified in the identifier with `@calendar=` takes precedence: `new NSLocale('ja_JP@calendar=japanese')` reads `'japanese'`. Without one, `de_DE` reads `'gregorian'`.

## Examples

```js
console.log(new NSLocale('ja_JP@calendar=japanese').calendarIdentifier);
```

**Result**: prints `japanese`.

## Corresponding iOS API

`NSLocale.calendarIdentifier`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForCalendarIdentifier()`](localizedstringforcalendaridentifier.md)
