---
type: reference
native: "+[NSLocale canonicalLanguageIdentifierFromString:]"
---

# `NSLocale.canonicalLanguageIdentifierFromString()` static method

The **`canonicalLanguageIdentifierFromString()`** static method rewrites a locale identifier as a language identifier in canonical form.

## Syntax

```
NSLocale.canonicalLanguageIdentifierFromString(string)
```

## Parameters

**`string`**

A locale identifier, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the language identifier in canonical form, separated by hyphens.

## Exceptions

None.

## Examples

```js
console.log(NSLocale.canonicalLanguageIdentifierFromString('en_US'));
```

**Result**: prints `en-US`.

## Corresponding iOS API

`+[NSLocale canonicalLanguageIdentifierFromString:]`.

## See also

- [`canonicalLocaleIdentifierFromString()`](canonicallocaleidentifierfromstring.md)
