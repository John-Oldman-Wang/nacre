---
type: reference
native: "+[NSLocale canonicalLocaleIdentifierFromString:]"
---

# `NSLocale.canonicalLocaleIdentifierFromString()` static method

The **`canonicalLocaleIdentifierFromString()`** static method rewrites a locale identifier with canonical capitalization.

## Syntax

```
NSLocale.canonicalLocaleIdentifierFromString(string)
```

## Parameters

**`string`**

A locale identifier, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the locale identifier in canonical form.

## Exceptions

None.

## Description

It changes capitalization but not separators: an identifier written with underscores comes back with underscores, and one written with hyphens comes back with hyphens. This is measured behavior; Apple's documentation does not say so.

## Examples

```js
console.log(NSLocale.canonicalLocaleIdentifierFromString('en_us'));
console.log(NSLocale.canonicalLocaleIdentifierFromString('zh-hans-cn'));
console.log(NSLocale.canonicalLocaleIdentifierFromString('en-US'));
```

**Result**: prints `en_US`, `zh-Hans-CN`, and `en-US`, in that order.

## Corresponding iOS API

`+[NSLocale canonicalLocaleIdentifierFromString:]`.

## See also

- [`canonicalLanguageIdentifierFromString()`](canonicallanguageidentifierfromstring.md)
