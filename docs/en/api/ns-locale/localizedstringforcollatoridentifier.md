---
type: reference
native: "-[NSLocale localizedStringForCollatorIdentifier:]"
---

# `NSLocale`: `localizedStringForCollatorIdentifier()` method

The **`localizedStringForCollatorIdentifier()`** method gives the name of a collator identifier in this locale's language.

## Syntax

```
localizedStringForCollatorIdentifier(collatorIdentifier)
```

## Parameters

**`collatorIdentifier`**

A collator identifier, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language. May be `null` when the code is not recognized. **Which codes give `null` is not verified in the simulator.**

## Exceptions

None.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForCollatorIdentifier('de'));
```

**Result**: prints a string or `null`. **The exact value is not recorded.**

## Corresponding iOS API

`-[NSLocale localizedStringForCollatorIdentifier:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`collatorIdentifier`](collatoridentifier.md)
