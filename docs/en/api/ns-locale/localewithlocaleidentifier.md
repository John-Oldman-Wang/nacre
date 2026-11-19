---
type: reference
native: "+[NSLocale localeWithLocaleIdentifier:]"
---

# `NSLocale.localeWithLocaleIdentifier()` static method

The **`localeWithLocaleIdentifier()`** static method creates a locale object from a locale identifier, same as [`new NSLocale()`](constructor.md).

## Syntax

```
NSLocale.localeWithLocaleIdentifier(localeIdentifier)
```

## Parameters

**`localeIdentifier`**

A locale identifier, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string. For how it is written, see the [constructor](constructor.md).

## Return value

A new `NSLocale`.

## Exceptions

None.

## Examples

```js
console.log(NSLocale.localeWithLocaleIdentifier('fr_FR').languageCode);
```

**Result**: prints `fr`.

## Corresponding iOS API

`+[NSLocale localeWithLocaleIdentifier:]`.

## See also

- [`NSLocale`](../ns-locale.md)
