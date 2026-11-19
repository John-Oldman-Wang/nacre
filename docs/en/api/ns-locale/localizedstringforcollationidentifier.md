---
type: reference
native: "-[NSLocale localizedStringForCollationIdentifier:]"
---

# `NSLocale`: `localizedStringForCollationIdentifier()` method

The **`localizedStringForCollationIdentifier()`** method gives the name of a collation identifier in this locale's language.

## Syntax

```
localizedStringForCollationIdentifier(collationIdentifier)
```

## Parameters

**`collationIdentifier`**

A collation identifier, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language. May be `null` when the code is not recognized. **Which codes give `null` is not verified in the simulator.**

## Exceptions

None.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForCollationIdentifier('phonebook'));
```

**Result**: prints `Phonebook Sort Order`.

## Corresponding iOS API

`-[NSLocale localizedStringForCollationIdentifier:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`collationIdentifier`](collationidentifier.md)
