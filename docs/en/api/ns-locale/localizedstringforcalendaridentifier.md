---
type: reference
native: "-[NSLocale localizedStringForCalendarIdentifier:]"
---

# `NSLocale`: `localizedStringForCalendarIdentifier()` method

The **`localizedStringForCalendarIdentifier()`** method gives the name of a calendar identifier in this locale's language.

## Syntax

```
localizedStringForCalendarIdentifier(calendarIdentifier)
```

## Parameters

**`calendarIdentifier`**

A calendar identifier, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language. May be `null` when the code is not recognized. **Which codes give `null` is not verified in the simulator.**

## Exceptions

None.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForCalendarIdentifier('gregorian'));
```

**Result**: prints `Gregorian Calendar`.

## Corresponding iOS API

`-[NSLocale localizedStringForCalendarIdentifier:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`calendarIdentifier`](calendaridentifier.md)
