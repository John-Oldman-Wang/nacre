---
type: reference
native: "-[NSLocale localizedStringForLocaleIdentifier:]"
---

# `NSLocale`: `localizedStringForLocaleIdentifier()` method

The **`localizedStringForLocaleIdentifier()`** method gives the name of a locale identifier in this locale's language.

## Syntax

```
localizedStringForLocaleIdentifier(localeIdentifier)
```

## Parameters

**`localeIdentifier`**

A locale identifier, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language.

## Exceptions

None.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForLocaleIdentifier('fr_FR'));
```

**Result**: prints `French (France)`.

## Corresponding iOS API

`-[NSLocale localizedStringForLocaleIdentifier:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`localeIdentifier`](localeidentifier.md)
