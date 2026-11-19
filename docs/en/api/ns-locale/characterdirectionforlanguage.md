---
type: reference
native: "+[NSLocale characterDirectionForLanguage:]"
---

# `NSLocale.characterDirectionForLanguage()` static method

The **`characterDirectionForLanguage()`** static method gives the direction in which a language's characters run within a line.

## Syntax

```
NSLocale.characterDirectionForLanguage(isoLangCode)
```

## Parameters

**`isoLangCode`**

A language code, such as `'ar'`. A string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string, one of the following values:

| Value | Meaning |
| --- | --- |
| `'leftToRight'` | Left to right |
| `'rightToLeft'` | Right to left |
| `'topToBottom'` | Top to bottom |
| `'bottomToTop'` | Bottom to top |
| `'unknown'` | Unknown |

## Exceptions

None.

## Description

To find out whether the interface as a whole runs left to right or right to left, read [`application.layoutDirection`](../application/layoutdirection.md) rather than working it out from the language yourself.

## Examples

```js
console.log(NSLocale.characterDirectionForLanguage('ar'));
console.log(NSLocale.characterDirectionForLanguage('en'));
```

**Result**: prints `rightToLeft`, then `leftToRight`.

## Corresponding iOS API

`+[NSLocale characterDirectionForLanguage:]`.

## See also

- [`lineDirectionForLanguage()`](linedirectionforlanguage.md)
